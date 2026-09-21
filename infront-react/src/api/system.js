import request from './request';

// 获取审计日志
export const getSystemLogs = () => request.get('/system/logs');

// 一键生成测试数据（救场神技）
export const generateMockData = () => request.post('/system/generate-mock');