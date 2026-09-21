module.exports = (err, req, res, next) => {
    console.error('🔥 全局异常拦截:', err.message);
    res.status(err.status || 500).json({
        code: 500,
        msg: '服务器内部错误，请稍后重试',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};