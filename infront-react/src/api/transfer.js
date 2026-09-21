import request from './request';

// 获取全局资源
export const getTransferResources = () => request.get('/transfer/resources');

// 执行跨店调拨
export const executeTransfer = (data) => request.post('/transfer/execute', data);

// 获取调拨记录
export const getTransferRecords = () => request.get('/transfer/records');