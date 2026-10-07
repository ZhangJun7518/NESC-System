/**
 * 智能补货路由
 * 包含：智能补货建议、补货任务单管理、一键补货
 */
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { checkPermission } = require("../middlewares/auth");

// 所有接口都需要登录
router.use(require("../middlewares/auth"));

// ==================== 1. 获取智能补货建议（加权移动平均算法） ====================
router.get("/suggestions", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "hq_leader";
    const storeFilter = isAdmin ? "" : `AND g.store_id = ${req.user.store_id}`;

    // 查询所有库存低于安全线的商品
    const [goods] = await pool.query(`
      SELECT 
        g.id, g.goods_name, g.spec, g.unit, g.stock, g.warning_num, g.store_id,
        (g.warning_num * 2) - g.stock AS simple_suggest
      FROM goods g
      WHERE g.stock <= g.warning_num ${storeFilter}
      ORDER BY g.stock ASC
    `);

    // 对每个商品，计算近 7 天加权移动平均
    const suggestions = [];
    for (const item of goods) {
      // 查询近 7 天该商品的每日销量
      const [sales] = await pool.query(
        `
        SELECT 
          DATE(sale_time) as date,
          SUM(quantity) as daily_sales
        FROM sales
        WHERE goods_id = ? 
          AND sale_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(sale_time)
        ORDER BY date ASC
      `,
        [item.id],
      );

      // 加权移动平均：第1天×1 + 第2天×2 + ... + 第7天×7
      let weightedSum = 0;
      let weightTotal = 0;
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - (6 - i));
        const dateStr = targetDate.toISOString().split("T")[0];

        const dayData = sales.find((s) => {
          const saleDate = new Date(s.date).toISOString().split("T")[0];
          return saleDate === dateStr;
        });

        const dailySales = dayData ? Number(dayData.daily_sales) : 0;
        const weight = i + 1;
        weightedSum += dailySales * weight;
        weightTotal += weight;
      }

      const avgDailySales = weightTotal > 0 ? weightedSum / weightTotal : 0;
      // 建议补货量 = 预测日销量 × 补货周期（7天） - 当前库存
      const suggestQty = Math.max(0, Math.ceil(avgDailySales * 7 - item.stock));

      suggestions.push({
        id: item.id,
        goods_name: item.goods_name,
        spec: item.spec,
        unit: item.unit,
        stock: item.stock,
        warning_num: item.warning_num,
        store_id: item.store_id,
        avg_daily_sales: Number(avgDailySales.toFixed(2)),
        suggest_quantity: suggestQty,
        simple_suggest: item.simple_suggest,
      });
    }

    res.json({ code: 200, data: suggestions });
  } catch (err) {
    console.error("获取补货建议失败:", err);
    res.json({ code: 500, msg: "获取补货建议失败: " + err.message });
  }
});

// ==================== 2. 创建补货任务单（一键补货） ====================
router.post(
  "/create",
  checkPermission("product:stock_in"),
  async (req, res) => {
    const { items } = req.body; // items: [{ goods_id, quantity, supplier, expected_date }]

    if (!items || items.length === 0) {
      return res.json({ code: 400, msg: "补货商品不能为空" });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const orderNos = [];
      for (const item of items) {
        // 生成补货单号：RO-日期-随机数
        const orderNo = `RO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
          Math.random() * 1000,
        )
          .toString()
          .padStart(3, "0")}`;

        await connection.query(
          `INSERT INTO replenish_orders 
         (order_no, goods_id, store_id, suggest_quantity, actual_quantity, supplier, expected_date, status, operator_id) 
         VALUES (?,?,?,?,?,?,?,?,?)`,
          [
            orderNo,
            item.goods_id,
            req.user.store_id,
            item.quantity,
            item.quantity,
            item.supplier || null,
            item.expected_date || null,
            "pending",
            req.user.id,
          ],
        );
        orderNos.push(orderNo);
      }

      // 写入审计日志
      await connection.query(
        "INSERT INTO audit_logs(user_id, action, details) VALUES (?,?,?)",
        [
          req.user.id,
          "创建补货单",
          `创建了 ${items.length} 条补货任务，单号：${orderNos.join(", ")}`,
        ],
      );

      await connection.commit();
      res.json({ code: 200, msg: "补货任务创建成功", data: { orderNos } });
    } catch (err) {
      await connection.rollback();
      console.error("创建补货单失败:", err);
      res.json({ code: 500, msg: "创建补货单失败: " + err.message });
    } finally {
      connection.release();
    }
  },
);

// ==================== 3. 获取补货任务单列表 ====================
router.get("/orders", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "hq_leader";
    const storeFilter = isAdmin
      ? ""
      : `WHERE ro.store_id = ${req.user.store_id}`;

    const [rows] = await pool.query(`
      SELECT 
        ro.*,
        g.goods_name,
        g.spec,
        g.unit,
        u.real_name as operator_name
      FROM replenish_orders ro
      LEFT JOIN goods g ON ro.goods_id = g.id
      LEFT JOIN users u ON ro.operator_id = u.id
      ${storeFilter}
      ORDER BY ro.create_time DESC
    `);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error("获取补货任务失败:", err);
    res.json({ code: 500, msg: "获取补货任务失败" });
  }
});

// ==================== 4. 更新补货单状态 ====================
router.put(
  "/orders/:id",
  checkPermission("product:stock_in"),
  async (req, res) => {
    const { id } = req.params;
    const { status, actual_quantity } = req.body;

    try {
      await pool.query(
        "UPDATE replenish_orders SET status = ?, actual_quantity = ? WHERE id = ?",
        [status, actual_quantity, id],
      );
      res.json({ code: 200, msg: "更新成功" });
    } catch (err) {
      console.error("更新补货单失败:", err);
      res.json({ code: 500, msg: "更新失败" });
    }
  },
);

// ==================== 5. 确认入库（补货单到货） ====================
router.post(
  "/orders/:id/receive",
  checkPermission("product:stock_in"),
  async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. 查询补货单
      const [orders] = await connection.query(
        "SELECT * FROM replenish_orders WHERE id = ?",
        [id],
      );
      if (orders.length === 0) throw new Error("补货单不存在");
      const order = orders[0];

      if (order.status === "received") throw new Error("该补货单已入库");

      // 2. 查询商品当前库存
      const [goods] = await connection.query(
        "SELECT * FROM goods WHERE id = ? FOR UPDATE",
        [order.goods_id],
      );
      if (goods.length === 0) throw new Error("商品不存在");
      const item = goods[0];

      const quantity = order.actual_quantity || order.suggest_quantity;
      const beforeStock = item.stock;
      const afterStock = beforeStock + quantity;

      // 3. 更新库存
      await connection.query("UPDATE goods SET stock = ? WHERE id = ?", [
        afterStock,
        order.goods_id,
      ]);

      // 4. 写入库存流水
      await connection.query(
        `INSERT INTO inventory_logs 
       (goods_id, store_id, change_type, change_quantity, before_stock, after_stock, reference_id, operator_id, remark) 
       VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          order.goods_id,
          order.store_id,
          "入库",
          quantity,
          beforeStock,
          afterStock,
          order.id,
          req.user.id,
          `补货单 ${order.order_no} 到货入库`,
        ],
      );

      // 5. 更新补货单状态
      await connection.query(
        "UPDATE replenish_orders SET status = ? WHERE id = ?",
        ["received", id],
      );

      // 6. 写入审计日志
      await connection.query(
        "INSERT INTO audit_logs(user_id, action, details) VALUES (?,?,?)",
        [
          req.user.id,
          "补货入库",
          `补货单 ${order.order_no} 到货，入库 ${quantity} 件`,
        ],
      );

      await connection.commit();
      res.json({ code: 200, msg: "入库成功" });
    } catch (err) {
      await connection.rollback();
      console.error("补货入库失败:", err);
      res.json({ code: 500, msg: "入库失败: " + err.message });
    } finally {
      connection.release();
    }
  },
);

module.exports = router;
