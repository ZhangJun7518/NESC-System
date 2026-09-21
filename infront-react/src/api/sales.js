import request from './request';

// 结算（扣库存+计算碳减排）
export const checkout = (data) => request.post('/sales/checkout', data);

// 获取销售记录
export const getSalesList = () => request.get('/sales/list');