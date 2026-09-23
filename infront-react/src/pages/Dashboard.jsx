import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Table, Tag, message, Button } from "antd";
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  CloudOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import {
  getDashboardStats,
  getDashboardTrend,
  getDashboardCategory,
  getDashboardWarnings,
  exportReplenish,
} from "../api/dashboard";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    goodsCount: 0,
    todaySales: 0,
    todayCarbon: 0,
    warningCount: 0,
  });
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resStats, resTrend, resCategory, resWarnings] = await Promise.all([
        getDashboardStats(),
        getDashboardTrend(),
        getDashboardCategory(),
        getDashboardWarnings(),
      ]);
      setStats(resStats.data);
      setTrendData(resTrend.data);
      setCategoryData(resCategory.data);
      setWarnings(resWarnings.data);
    } catch (error) {
      message.error("数据获取失败");
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportReplenish();
      const blob = new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `补货清单_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("导出成功");
    } catch (error) {
      message.error("导出失败");
    }
  };

  const lineOption = {
    title: {
      text: t("dashboard.trend_title") || "近7日销售趋势",
      left: "center",
      textStyle: { color: "#003a70", fontSize: 13 },
    },
    tooltip: { trigger: "axis", confine: true },
    grid: { top: 40, right: 20, bottom: 30, left: 40 },
    xAxis: {
      type: "category",
      data: trendData.map((item) => item.date),
      axisLabel: { fontSize: 10, interval: 0 },
    },
    yAxis: { type: "value", axisLabel: { fontSize: 10 } },
    series: [
      {
        data: trendData.map((item) => item.sales),
        type: "line",
        smooth: true,
        label: { show: true, position: "top", fontSize: 10, formatter: "{c}" },
        areaStyle: { color: "rgba(0, 58, 112, 0.1)" },
        lineStyle: { color: "#003a70", width: 2 },
        itemStyle: { color: "#003a70" },
      },
    ],
  };

  const pieOption = {
    title: {
      text: t("dashboard.category_title") || "分类库存占比",
      left: "center",
      textStyle: { color: "#003a70", fontSize: 13 },
    },
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: "55%",
        label: { show: true, formatter: "{b}: {c}", fontSize: 10 },
        data: categoryData.map((item) => ({
          value: item.value,
          name: item.name,
        })),
      },
    ],
  };

  const columns = [
    {
      title: t("product.name") || "商品名称",
      dataIndex: "goods_name",
      key: "goods_name",
    },
    {
      title: t("product.category") || "分类",
      dataIndex: "category",
      key: "category",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: t("product.stock") || "当前库存",
      dataIndex: "stock",
      key: "stock",
      render: (text) => (
        <span style={{ color: "red", fontWeight: "bold" }}>{text}</span>
      ),
    },
    {
      title: t("product.warning") || "预警值",
      dataIndex: "warning_num",
      key: "warning_num",
    },
    {
      title: "建议补货量",
      dataIndex: "suggest_quantity",
      key: "suggest_quantity",
      render: (text) => <Tag color="green">{text}</Tag>,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* 👈 使用响应式断点：手机上一行1个，平板一行2个，电脑一行4个 */}
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title={t("dashboard.total_goods") || "总商品数"}
              value={stats.goodsCount}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#003a70", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title={t("dashboard.today_sales") || "今日销售额 (¥)"}
              value={stats.todaySales}
              precision={2}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#3f8600", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title={t("dashboard.today_carbon") || "今日碳减排 (kg)"}
              value={stats.todayCarbon}
              precision={2}
              prefix={<CloudOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title={t("dashboard.warning_count") || "库存预警数"}
              value={stats.warningCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#cf1322", fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 👈 图表区域：手机上一行1个，电脑上一行2个 */}
      <Row gutter={[8, 8]}>
        <Col xs={24} md={16}>
          <Card
            size="small"
            style={{ height: "220px" }}
            bodyStyle={{ height: "100%", padding: 4 }}
          >
            <ReactECharts option={lineOption} style={{ height: "100%" }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            size="small"
            style={{ height: "220px" }}
            bodyStyle={{ height: "100%", padding: 4 }}
          >
            <ReactECharts option={pieOption} style={{ height: "100%" }} />
          </Card>
        </Col>
      </Row>

      <Card
        title={t("dashboard.replenish_title") || "🤖 智能补货建议"}
        size="small"
        style={{ flex: 1 }}
        extra={
          <Button type="primary" size="small" onClick={handleExport}>
            {t("dashboard.export_btn") || "导出补货清单"}
          </Button>
        }
        bodyStyle={{ padding: 0 }}
      >
        {/* 👈 手机端表格：去掉内部高度限制，允许横向滚动，纵向自然展开 */}
        <Table
          key={i18n.language}
          rowKey="id"
          columns={columns}
          dataSource={warnings}
          pagination={{ pageSize: 10, size: "small" }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};
export default Dashboard;
