const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middlewares/auth');

router.use(auth); // 看板所有接口需登录

// 1. 统计卡片数据
router.get('/stats', async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'hq_leader';
        const storeFilter = isAdmin ? '' : `WHERE store_id = ${req.user.store_id}`;
        const storeAnd = isAdmin ? '' : `AND store_id = ${req.user.store_id}`;

        const [goodsCount] = await pool.query(`SELECT COUNT(*) as count FROM goods ${storeFilter}`);
        const [todaySales] = await pool.query(`SELECT IFNULL(SUM(total_price), 0) as amount FROM sales WHERE DATE(sale_time) = CURDATE() ${storeAnd}`);
        const [todayCarbon] = await pool.query(`SELECT IFNULL(SUM(carbon_saving_total), 0) as carbon FROM sales WHERE DATE(sale_time) = CURDATE() ${storeAnd}`);
        const [warningCount] = await pool.query(`SELECT COUNT(*) as count FROM goods WHERE stock <= warning_num ${storeAnd}`);

        res.json({
            code: 200,
            data: { goodsCount: goodsCount[0].count, todaySales: todaySales[0].amount, todayCarbon: todayCarbon[0].carbon, warningCount: warningCount[0].count }
        });
    } catch (err) { res.json({ code: 500, msg: '获取统计数据失败' }); }
});

// 2. 近7天销售趋势（折线图）
router.get('/trend', async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'hq_leader';
        const storeFilter = isAdmin ? '' : `AND store_id = ${req.user.store_id}`;
        const [rows] = await pool.query(`SELECT DATE_FORMAT(sale_time, '%Y-%m-%d') as date, SUM(total_price) as sales FROM sales WHERE sale_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) ${storeFilter} GROUP BY DATE_FORMAT(sale_time, '%Y-%m-%d') ORDER BY date ASC`);
        res.json({ code: 200, data: rows });
    } catch (err) { res.json({ code: 500, msg: '获取趋势失败' }); }
});

// 3. 分类库存占比（饼图）
router.get('/category', async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'hq_leader';
        const storeFilter = isAdmin ? '' : `WHERE store_id = ${req.user.store_id}`;
        const [rows] = await pool.query(`SELECT category as name, SUM(stock) as value FROM goods ${storeFilter} GROUP BY category`);
        res.json({ code: 200, data: rows });
    } catch (err) { res.json({ code: 500, msg: '获取分类失败' }); }
});

// 4. 智能补货建议与预警列表
router.get('/warnings', async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'hq_leader';
        const storeFilter = isAdmin ? '' : `AND store_id = ${req.user.store_id}`;
        const [rows] = await pool.query(`SELECT id, goods_name, category, stock, warning_num, store_id, (warning_num * 2) - stock AS suggest_quantity FROM goods WHERE stock <= warning_num ${storeFilter} ORDER BY stock ASC`);
        res.json({ code: 200, data: rows });
    } catch (err) { res.json({ code: 500, msg: '获取预警失败' }); }
});

module.exports = router;