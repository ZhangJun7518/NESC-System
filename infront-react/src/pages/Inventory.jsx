/**
 * 库存管理主页面
 * 包含：入库管理、出库管理、预警管理、库存流水、仓库平面图
 */
import React, { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Button,
  message,
  Space,
  Select,
  DatePicker,
} from "antd";
import {
  ImportOutlined,
  ExportOutlined,
  WarningOutlined,
  HistoryOutlined,
  ReloadOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { getInventoryLogs, getInventoryStats } from "../api/inventory";
import { getSuggestions } from "../api/replenish";
import { getProductList } from "../api/product";
import WarehouseMap from "../components/WarehouseMap";

const { RangePicker } = DatePicker;

const Inventory = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    todayInbound: 0,
    todayOutbound: 0,
    todayTransfer: 0,
  });
  const [warnings, setWarnings] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.change_type = filterType;
      if (dateRange && dateRange[0])
        params.start_date = dateRange[0].format("YYYY-MM-DD");
      if (dateRange && dateRange[1])
        params.end_date = dateRange[1].format("YYYY-MM-DD");
      const res = await getInventoryLogs(params);
      setLogs(res.data);
    } catch (error) {
      message.error("获取库存流水失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getInventoryStats();
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWarnings = async () => {
    try {
      const res = await getSuggestions();
      setWarnings(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProductList();
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
    fetchWarnings();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filterType, dateRange]);

  const logColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: t("product.name") || "商品名称",
      dataIndex: "goods_name",
      key: "goods_name",
    },
    {
      title: t("product.spec") || "规格",
      dataIndex: "spec",
      key: "spec",
      width: 100,
    },
    {
      title: "变动类型",
      dataIndex: "change_type",
      key: "change_type",
      width: 100,
      render: (text) => {
        const colorMap = {
          入库: "green",
          销售: "red",
          调拨: "blue",
          盘点: "orange",
        };
        return <Tag color={colorMap[text] || "default"}>{text}</Tag>;
      },
    },
    {
      title: "变动数量",
      dataIndex: "change_quantity",
      key: "change_quantity",
      width: 100,
      render: (text) => (
        <span style={{ color: text > 0 ? "green" : "red", fontWeight: "bold" }}>
          {text > 0 ? `+${text}` : text}
        </span>
      ),
    },
    {
      title: "变动前",
      dataIndex: "before_stock",
      key: "before_stock",
      width: 80,
    },
    {
      title: "变动后",
      dataIndex: "after_stock",
      key: "after_stock",
      width: 80,
    },
    {
      title: "操作人",
      dataIndex: "operator_name",
      key: "operator_name",
      width: 100,
    },
    { title: "备注", dataIndex: "remark", key: "remark", ellipsis: true },
    {
      title: "时间",
      dataIndex: "create_time",
      key: "create_time",
      width: 160,
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm"),
    },
  ];

  const warningColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: t("product.name") || "商品名称",
      dataIndex: "goods_name",
      key: "goods_name",
    },
    {
      title: t("product.spec") || "规格",
      dataIndex: "spec",
      key: "spec",
      width: 100,
    },
    {
      title: "当前库存",
      dataIndex: "stock",
      key: "stock",
      width: 100,
      render: (text) => (
        <span style={{ color: "red", fontWeight: "bold" }}>{text}</span>
      ),
    },
    {
      title: "预警值",
      dataIndex: "warning_num",
      key: "warning_num",
      width: 100,
    },
    {
      title: "日均销量",
      dataIndex: "avg_daily_sales",
      key: "avg_daily_sales",
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "建议补货量",
      dataIndex: "suggest_quantity",
      key: "suggest_quantity",
      width: 120,
      render: (text) => <Tag color="green">{text}</Tag>,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Row gutter={8}>
        <Col span={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title="今日入库"
              value={stats.todayInbound}
              prefix={<ImportOutlined />}
              valueStyle={{ color: "#3f8600", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title="今日出库"
              value={stats.todayOutbound}
              prefix={<ExportOutlined />}
              valueStyle={{ color: "#cf1322", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title="今日调拨"
              value={stats.todayTransfer}
              prefix={<HistoryOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title="库存预警数"
              value={warnings.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#faad14", fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      <Card size="small" bodyStyle={{ padding: 0 }}>
        <Tabs
          defaultActiveKey="1"
          style={{ padding: "0 16px" }}
          items={[
            {
              key: "1",
              label: (
                <span>
                  <ImportOutlined /> 入库管理
                </span>
              ),
              children: (
                <div style={{ padding: "0 0 16px" }}>
                  <Space style={{ marginBottom: 12 }}>
                    <Button
                      type="primary"
                      icon={<ImportOutlined />}
                      onClick={() => navigate("/product")}
                    >
                      前往商品管理入库
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
                      刷新
                    </Button>
                  </Space>
                  <p style={{ color: "#888", fontSize: 12 }}>
                    提示：入库操作在“商品管理”页面点击“入库”按钮，库存流水会自动记录在本页面。
                  </p>
                </div>
              ),
            },
            {
              key: "2",
              label: (
                <span>
                  <ExportOutlined /> 出库管理
                </span>
              ),
              children: (
                <div style={{ padding: "0 0 16px" }}>
                  <Space style={{ marginBottom: 12 }}>
                    <Button
                      type="primary"
                      icon={<ExportOutlined />}
                      onClick={() => navigate("/sales")}
                    >
                      前往收银台出库
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
                      刷新
                    </Button>
                  </Space>
                  <p style={{ color: "#888", fontSize: 12 }}>
                    提示：出库操作在“收银台”页面扫码结算，库存流水会自动记录在本页面。
                  </p>
                </div>
              ),
            },
            {
              key: "3",
              label: (
                <span>
                  <WarningOutlined /> 预警管理
                </span>
              ),
              children: (
                <Table
                  key={i18n.language}
                  rowKey="id"
                  columns={warningColumns}
                  dataSource={warnings}
                  pagination={{ pageSize: 10, size: "small" }}
                  scroll={{ x: "max-content" }}
                />
              ),
            },
            {
              key: "4",
              label: (
                <span>
                  <HistoryOutlined /> 库存流水
                </span>
              ),
              children: (
                <div>
                  <Space style={{ marginBottom: 12 }} wrap>
                    <Select
                      placeholder="变动类型"
                      allowClear
                      style={{ width: 120 }}
                      size="small"
                      onChange={setFilterType}
                      options={[
                        { value: "入库", label: "入库" },
                        { value: "销售", label: "销售" },
                        { value: "调拨", label: "调拨" },
                      ]}
                    />
                    <RangePicker size="small" onChange={setDateRange} />
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchLogs}
                      size="small"
                    >
                      刷新
                    </Button>
                  </Space>
                  <Table
                    key={i18n.language}
                    rowKey="id"
                    columns={logColumns}
                    dataSource={logs}
                    loading={loading}
                    pagination={{ pageSize: 10, size: "small" }}
                    scroll={{ x: "max-content" }}
                  />
                </div>
              ),
            },
            {
              key: "5",
              label: (
                <span>
                  <AppstoreOutlined /> 仓库平面图
                </span>
              ),
              children: (
                <div style={{ padding: "16px 0" }}>
                  <WarehouseMap goods={products} />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Inventory;
