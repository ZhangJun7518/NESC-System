const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ 数据库连接失败，请检查 Docker 是否启动、端口是否为 3307！', err.message);
    } else {
        console.log('✅ 数据库连接成功: nesc_db');
        connection.release();
    }
});

module.exports = pool.promise();