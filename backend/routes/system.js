const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/auth');

// 系统模块所有接口都需要登录
router.use(auth);

// 1. 获取审计日志
router.get('/logs', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT a.*, u.username 
      FROM audit_logs a 
      LEFT JOIN users u ON a.user_id = u.id 
      ORDER BY a.create_time DESC 
      LIMIT 100
    `);
        res.json({ code: 200, data: rows });
    } catch (err) {
        console.error('获取日志失败:', err);
        res.json({ code: 500, msg: '获取日志失败' });
    }
});

// 2. 一键生成模拟数据（仅管理员可用，答辩救场神技）
router.post('/generate-mock', checkPermission('system:reset'), async (req, res) => {
    try {
        // 清空旧销售数据
        await pool.query('TRUNCATE TABLE sales');

        // 重新生成 500 条随机数据
        let values = [];
        for (let i = 0; i < 500; i++) {
            const goodsId = Math.floor(Math.random() * 11) + 1; // 随机商品 ID 1-11
            const qty = Math.floor(Math.random() * 3) + 1;      // 随机数量 1-3
            const price = (Math.random() * 100 + 5).toFixed(2);  // 随机金额
            const carbon = (Math.random() * 10).toFixed(2);     // 随机碳减排量
            const storeId = Math.random() > 0.5 ? 1 : 2;         // 随机分配到A店或B店
            values.push(`(${goodsId}, ${qty}, ${price}, ${carbon}, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*30) DAY), ${storeId}, 5)`);
        }

        const sql = 'INSERT INTO sales(goods_id, quantity, total_price, carbon_saving_total, sale_time, store_id, operator_id) VALUES ' + values.join(',');
        await pool.query(sql);

        res.json({ code: 200, msg: '已重新生成 500 条销售数据' });
    } catch (err) {
        console.error('生成模拟数据失败:', err);
        res.json({ code: 500, msg: '生成失败: ' + err.message });
    }
});

// ⚠️ 最后一行必须是这个，绝对不能丢
module.exports = router;