/**
 * 库存管理路由
 * 包含：库存流水查询、库存变动统计、库存变动记录（供其他模块调用）
 */
const express = require("express");
const router = express.Router();
const pool = require("../db");

// 所有接口都需要登录
router.use(require("../middlewares/auth"));

// ==================== 1. 获取库存流水（支持筛选） ====================
router.get("/logs", async (req, res) => {
  try {
    const { goods_id, change_type, start_date, end_date } = req.query;
    const isAdmin = req.user.role === "admin" || req.user.role === "hq_leader";

    let sql = `
      SELECT 
        il.*,
        g.goods_name,
        g.spec,
        g.unit,
        u.real_name as operator_name
      FROM inventory_logs il
      LEFT JOIN goods g ON il.goods_id = g.id
      LEFT JOIN users u ON il.operator_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // 非管理员只能看本店
    if (!isAdmin) {
      sql += " AND il.store_id = ?";
      params.push(req.user.store_id);
    }

    // 筛选条件
    if (goods_id) {
      sql += " AND il.goods_id = ?";
      params.push(goods_id);
    }
    if (change_type) {
      sql += " AND il.change_type = ?";
      params.push(change_type);
    }
    if (start_date) {
      sql += " AND il.create_time >= ?";
      params.push(start_date);
    }
    if (end_date) {
      sql += " AND il.create_time <= ?";
      params.push(end_date);
    }

    sql += " ORDER BY il.create_time DESC LIMIT 200";

    const [rows] = await pool.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error("获取库存流水失败:", err);
    res.json({ code: 500, msg: "获取库存流水失败" });
  }
});

// ==================== 2. 获取库存变动统计 ====================
router.get("/stats", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "hq_leader";
    const storeFilter = isAdmin ? "" : `AND store_id = ${req.user.store_id}`;

    // 今日入库总数
    const [inbound] = await pool.query(`
      SELECT IFNULL(SUM(change_quantity), 0) as total 
      FROM inventory_logs 
      WHERE change_type = '入库' 
      AND DATE(create_time) = CURDATE() ${storeFilter}
    `);

    // 今日出库总数
    const [outbound] = await pool.query(`
      SELECT IFNULL(SUM(ABS(change_quantity)), 0) as total 
      FROM inventory_logs 
      WHERE change_type = '销售' 
      AND DATE(create_time) = CURDATE() ${storeFilter}
    `);

    // 今日调拨总数
    const [transfer] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM inventory_logs 
      WHERE change_type = '调拨' 
      AND DATE(create_time) = CURDATE() ${storeFilter}
    `);

    res.json({
      code: 200,
      data: {
        todayInbound: inbound[0].total,
        todayOutbound: outbound[0].total,
        todayTransfer: transfer[0].total,
      },
    });
  } catch (err) {
    console.error("获取库存统计失败:", err);
    res.json({ code: 500, msg: "获取库存统计失败" });
  }
});

// ==================== 3. 记录库存变动（供其他模块调用） ====================
/**
 * 这个函数不暴露为 API，供 sales.js、transfer.js、product.js 调用
 * 使用方式：
 *   const { recordInventoryLog } = require('./inventory');
 *   await recordInventoryLog(connection, { ... });
 */
const recordInventoryLog = async (
  connection,
  {
    goods_id,
    store_id,
    change_type,
    change_quantity,
    before_stock,
    after_stock,
    reference_id = null,
    operator_id,
    remark = null,
  },
) => {
  await connection.query(
    `INSERT INTO inventory_logs 
     (goods_id, store_id, change_type, change_quantity, before_stock, after_stock, reference_id, operator_id, remark) 
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      goods_id,
      store_id,
      change_type,
      change_quantity,
      before_stock,
      after_stock,
      reference_id,
      operator_id,
      remark,
    ],
  );
};

module.exports = router;
module.exports.recordInventoryLog = recordInventoryLog;
