import request from "./request";

// 获取库存流水（支持筛选）
export const getInventoryLogs = (params) =>
  request.get("/inventory/logs", { params });

// 获取库存统计
export const getInventoryStats = () => request.get("/inventory/stats");
