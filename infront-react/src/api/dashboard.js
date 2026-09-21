import request from './request';

// 获取顶部统计卡片数据
export const getDashboardStats = () => request.get('/dashboard/stats');

// 获取近7天销售趋势（折线图）
export const getDashboardTrend = () => request.get('/dashboard/trend');

// 获取分类库存占比（饼图）
export const getDashboardCategory = () => request.get('/dashboard/category');

// 获取库存预警与智能补货列表（表格）
export const getDashboardWarnings = () => request.get('/dashboard/warnings');

// 导出补货清单 Excel（👈 这就是缺少的这行，必须加上）
export const exportReplenish = () => request.get('/dashboard/export-replenish', { responseType: 'blob' });