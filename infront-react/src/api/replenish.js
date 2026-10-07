import request from "./request";

// 获取智能补货建议
export const getSuggestions = () => request.get("/replenish/suggestions");

// 创建补货任务单（一键补货）
export const createReplenishOrder = (items) =>
  request.post("/replenish/create", { items });

// 获取补货任务单列表
export const getReplenishOrders = () => request.get("/replenish/orders");

// 更新补货单状态
export const updateReplenishOrder = (id, data) =>
  request.put(`/replenish/orders/${id}`, data);

// 确认到货入库
export const receiveReplenishOrder = (id) =>
  request.post(`/replenish/orders/${id}/receive`);
