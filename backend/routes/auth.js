const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// ⚠️ 极其关键：这里绝对不能加 router.use(auth)！
// 登录接口是用来获取 Token 的，如果它自己都需要 Token，就会陷入死循环导致 401。
// 登录路由
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. 基础校验
    if (!username || !password) {
        return res.json({ code: 400, msg: '用户名和密码不能为空' });
    }

    try {
        // 2. 查询用户
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.json({ code: 400, msg: '用户名或密码错误' });
        }

        const user = users[0];

        // 3. 校验密码（演示用明文，实际项目应用 bcrypt.compare）
        if (user.password !== password) {
            return res.json({ code: 400, msg: '用户名或密码错误' });
        }

        // 4. 生成 JWT Token（包含角色和门店 ID，供后端权限中间件使用）
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                store_id: user.store_id
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // 5. 返回成功数据
        res.json({
            code: 200,
            msg: '登录成功',
            data: {
                token,
                userInfo: {
                    id: user.id,
                    username: user.username,
                    real_name: user.real_name,
                    role: user.role,
                    store_id: user.store_id
                }
            }
        });

    } catch (err) {
        console.error('登录接口报错:', err);
        res.json({ code: 500, msg: '服务器内部错误' });
    }
});

// ⚠️ 确保最后一行是这个，不要写成 { router }
module.exports = router;