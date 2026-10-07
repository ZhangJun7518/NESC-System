const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middlewares/auth");
const ExcelJS = require("exceljs");

router.use(auth);

// ==================== 1. 统计卡片数据 ====================
router.get("/stats", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "hq_leader";
    const storeFilter = isAdmin ? "" : `WHERE store_id = ${req.user.store_id}`;
    const storeAnd = isAdmin ? "" : `AND store_id = ${req.user.store_id}`;

    const [goodsCount] = await pool.query(
      `SELECT COUNT(*) as count FROM goods ${storeFilter}`,
    );
    const [todaySales] = await pool.query(
      `SELECT IFNULL(SUM(total_price), 0) as amount FROM sales WHERE DATE(sale_time) = CURDATE() ${storeAnd}`,
    );
    const [todayCarbon] = await pool.query(
      `SELECT IFNULL(SUM(carbon_saving_total), 0) as carbon FROM sales WHERE DATE(sale_time) = CURDATE() ${storeAnd}`,
    );
    const [warningCount] = await pool.query(
      `SELECT COUNT(*) as count FROM goods WHERE stock <= warning_num ${storeAnd}`,
    );

    res.json({
      code: 200,
      data: {
        goodsCount: goodsCount[0].count,
        todaySales: todaySales[0].amount,
        todayCarbon: todayCarbon[0].carbon,
        warningCount: warningCount[0].count,
      },
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: "获取统计数据失败" });
  }
});

// ==================== 2. 近7天销售趋势 ====================
router.get("/trend", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "hq_leader";
    const storeFilter = isAdmin ? "" : `AND store_id = ${req.user.store_id}`;
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(sale_time, '%Y-%m-%d') as date, SUM(total_price) as sales 
      FROM sales 
      WHERE sale_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) ${storeFilter} 
      GROUP BY DATE_FORMAT(sale_time, '%Y-%m-%d') 
      ORDER BY date ASC
    `);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: "获取趋势失败" });
  }
});

// ==================== 3. 分类库存占比 ====================
router.get("/category", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "hq_leader";
    const storeFilter = isAdmin ? "" : `WHERE store_id = ${req.user.store_id}`;
    const [rows] = await pool.query(
      `SELECT category as name, SUM(stock) as value FROM goods ${storeFilter} GROUP BY category`,
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: "获取分类失败" });
  }
});

// ==================== 4. 智能补货建议 ====================
router.get("/warnings", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "hq_leader";
    const storeFilter = isAdmin ? "" : `AND store_id = ${req.user.store_id}`;
    const [rows] = await pool.query(`
      SELECT id, goods_name, category, stock, warning_num, store_id, (warning_num * 2) - stock AS suggest_quantity 
      FROM goods 
      WHERE stock <= warning_num ${storeFilter} 
      ORDER BY stock ASC
    `);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: "获取预警失败" });
  }
});

// ==================== 5. 导出补货清单 Excel ====================
router.get("/export-replenish", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "hq_leader";
    const storeFilter = isAdmin ? "" : `AND store_id = ${req.user.store_id}`;

    const [rows] = await pool.query(`
      SELECT 
        goods_name, category, spec, unit, stock, warning_num, store_id,
        (warning_num * 2) - stock AS suggest_quantity
      FROM goods 
      WHERE stock <= warning_num ${storeFilter}
      ORDER BY store_id, stock ASC
    `);

    if (rows.length === 0) {
      return res.json({ code: 400, msg: "当前没有需要补货的商品" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("智能补货清单");

    worksheet.columns = [
      { header: "所属门店", key: "store_name", width: 15 },
      { header: "商品名称", key: "goods_name", width: 25 },
      { header: "分类", key: "category", width: 15 },
      { header: "规格", key: "spec", width: 15 },
      { header: "单位", key: "unit", width: 10 },
      { header: "当前库存", key: "stock", width: 12 },
      { header: "预警值", key: "warning_num", width: 12 },
      { header: "建议补货量", key: "suggest_quantity", width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF003A70" },
    };
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    rows.forEach((item) => {
      worksheet.addRow({
        store_name: item.store_id === 1 ? "A店" : "B店",
        goods_name: item.goods_name,
        category: item.category,
        spec: item.spec,
        unit: item.unit,
        stock: item.stock,
        warning_num: item.warning_num,
        suggest_quantity: item.suggest_quantity,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=replenish_list.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, msg: "导出失败" });
  }
});

// ==================== 6. 库存周转率分析 ====================
router.get("/turnover", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "hq_leader";
    const storeFilter = isAdmin ? "" : `AND store_id = ${req.user.store_id}`;

    // 近30天销售成本（用售价近似）
    const [salesCost] = await pool.query(`
      SELECT IFNULL(SUM(total_price), 0) as cost
      FROM sales
      WHERE sale_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) ${storeFilter}
    `);

    // 当前总库存金额（进货价 × 库存量）
    const [stockValue] = await pool.query(`
      SELECT IFNULL(SUM(purchase_price * stock), 0) as value
      FROM goods
      WHERE 1=1 ${isAdmin ? "" : `AND store_id = ${req.user.store_id}`}
    `);

    const cost = Number(salesCost[0].cost);
    const avgStock = Number(stockValue[0].value) || 1;
    const turnoverRate = (cost / avgStock).toFixed(2);
    const turnoverDays = turnoverRate > 0 ? (30 / turnoverRate).toFixed(1) : 0;

    res.json({
      code: 200,
      data: {
        salesCost: cost,
        stockValue: avgStock,
        turnoverRate: Number(turnoverRate),
        turnoverDays: Number(turnoverDays),
      },
    });
  } catch (err) {
    console.error("获取库存周转率失败:", err);
    res.json({ code: 500, msg: "获取库存周转率失败" });
  }
});

module.exports = router;
