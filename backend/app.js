const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ================= 基础中间件 =================
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析 JSON 请求体

// ================= 测试接口 =================
app.get('/api/test', (req, res) => {
    res.json({ code: 200, msg: 'NESC 后端服务运行正常！' });
});

// ================= 业务路由 =================
app.use('/api/auth', require('./routes/auth'));           // 登录鉴权
app.use('/api/dashboard', require('./routes/dashboard')); // 看板数据
app.use('/api/product', require('./routes/product'));     // 商品管理
app.use('/api/sales', require('./routes/sales'));         // 销售收银
app.use('/api/transfer', require('./routes/transfer'));   // 智能调拨
app.use('/api/system', require('./routes/system'));       // 系统设置与日志

// ================= 全局异常拦截（必须放在所有路由最后） =================
app.use(require('./middlewares/errorHandler'));

// ================= 启动服务 =================
app.listen(PORT, () => {
    console.log(`✅ NESC 后端服务启动成功，端口: ${PORT}`);
    console.log(`👉 测试接口: http://localhost:${PORT}/api/test`);
});