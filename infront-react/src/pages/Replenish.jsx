/**
 * 智能补货页面
 * 包含：补货建议（可编辑+一键补货）、补货任务单（状态管理+导出Excel）
 */
import React, { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  Table,
  Tag,
  Button,
  message,
  Space,
  InputNumber,
  Checkbox,
  Select,
  DatePicker,
  Popconfirm,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ThunderboltOutlined,
  ReloadOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  getSuggestions,
  createReplenishOrder,
  getReplenishOrders,
  receiveReplenishOrder,
} from "../api/replenish";

const Replenish = () => {
  const { t, i18n } = useTranslation();
  const [suggestions, setSuggestions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [editedQuantities, setEditedQuantities] = useState({}); // { goods_id: quantity }
  const [loading, setLoading] = useState(false);

  // ==================== 数据请求 ====================
  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await getSuggestions();
      setSuggestions(res.data);
      // 初始化编辑数量为系统建议值
      const initQty = {};
      res.data.forEach((item) => {
        initQty[item.id] = item.suggest_quantity;
      });
      setEditedQuantities(initQty);
    } catch (error) {
      message.error("获取补货建议失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await getReplenishOrders();
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    fetchOrders();
  }, []);

  // ==================== 一键补货 ====================
  const handleBatchReplenish = async () => {
    if (selectedKeys.length === 0) {
      return message.warning("请至少勾选一个商品");
    }

    const items = selectedKeys.map((id) => {
      const item = suggestions.find((s) => s.id === id);
      return {
        goods_id: id,
        quantity: editedQuantities[id] || item.suggest_quantity,
        supplier: null,
        expected_date: dayjs().add(3, "day").format("YYYY-MM-DD"),
      };
    });

    try {
      await createReplenishOrder(items);
      message.success(`成功创建 ${items.length} 条补货任务`);
      setSelectedKeys([]);
      fetchSuggestions();
      fetchOrders();
    } catch (error) {
      message.error("创建补货任务失败");
    }
  };

  // ==================== 确认到货入库 ====================
  const handleReceive = async (id) => {
    try {
      await receiveReplenishOrder(id);
      message.success("入库成功，库存已更新");
      fetchOrders();
    } catch (error) {
      message.error("入库失败");
    }
  };

  // ==================== 补货建议表格列 ====================
  const suggestionColumns = [
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
      width: 80,
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
      width: 110,
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "实际补货量",
      key: "actual_quantity",
      width: 130,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={editedQuantities[record.id]}
          onChange={(val) =>
            setEditedQuantities({ ...editedQuantities, [record.id]: val })
          }
          size="small"
          style={{ width: 100 }}
        />
      ),
    },
  ];

  // ==================== 补货任务单表格列 ====================
  const orderColumns = [
    { title: "补货单号", dataIndex: "order_no", key: "order_no", width: 180 },
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
      title: "补货数量",
      dataIndex: "actual_quantity",
      key: "actual_quantity",
      width: 100,
    },
    {
      title: "供应商",
      dataIndex: "supplier",
      key: "supplier",
      width: 140,
      render: (text) => text || "-",
    },
    {
      title: "预计到货",
      dataIndex: "expected_date",
      key: "expected_date",
      width: 110,
      render: (text) => (text ? dayjs(text).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (text) => {
        const map = {
          pending: {
            color: "orange",
            label: "待处理",
            icon: <ClockCircleOutlined />,
          },
          ordered: { color: "blue", label: "已下单", icon: <InboxOutlined /> },
          received: {
            color: "green",
            label: "已入库",
            icon: <CheckCircleOutlined />,
          },
        };
        const cfg = map[text] || map.pending;
        return (
          <Tag color={cfg.color} icon={cfg.icon}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      width: 130,
      render: (_, record) =>
        record.status !== "received" ? (
          <Popconfirm
            title="确认该补货单已到货并入库？"
            onConfirm={() => handleReceive(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" icon={<CheckCircleOutlined />}>
              确认入库
            </Button>
          </Popconfirm>
        ) : (
          <span style={{ color: "#999" }}>已完成</span>
        ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* 顶部统计 */}
      <Row gutter={8}>
        <Col span={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title="待补货商品"
              value={suggestions.length}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: "#cf1322", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title="补货任务单"
              value={orders.length}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title="待处理"
              value={orders.filter((o) => o.status === "pending").length}
              valueStyle={{ color: "#faad14", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
            <Statistic
              title="已入库"
              value={orders.filter((o) => o.status === "received").length}
              valueStyle={{ color: "#3f8600", fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card size="small" bodyStyle={{ padding: 0 }}>
        <Tabs
          defaultActiveKey="1"
          style={{ padding: "0 16px" }}
          items={[
            {
              key: "1",
              label: (
                <span>
                  <ThunderboltOutlined /> 补货建议
                </span>
              ),
              children: (
                <div>
                  <Space style={{ marginBottom: 12 }} wrap>
                    <Button
                      type="primary"
                      icon={<ThunderboltOutlined />}
                      onClick={handleBatchReplenish}
                      disabled={selectedKeys.length === 0}
                    >
                      一键补货 ({selectedKeys.length})
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchSuggestions}
                    >
                      刷新
                    </Button>
                    <span style={{ color: "#888", fontSize: 12 }}>
                      提示：补货量默认使用加权移动平均算法计算，可手动修改。
                    </span>
                  </Space>
                  <Table
                    key={i18n.language}
                    rowKey="id"
                    columns={suggestionColumns}
                    dataSource={suggestions}
                    loading={loading}
                    pagination={{ pageSize: 10, size: "small" }}
                    scroll={{ x: "max-content" }}
                    rowSelection={{
                      selectedRowKeys: selectedKeys,
                      onChange: setSelectedKeys,
                    }}
                  />
                </div>
              ),
            },
            {
              key: "2",
              label: (
                <span>
                  <InboxOutlined /> 补货任务单
                </span>
              ),
              children: (
                <Table
                  key={i18n.language}
                  rowKey="id"
                  columns={orderColumns}
                  dataSource={orders}
                  pagination={{ pageSize: 10, size: "small" }}
                  scroll={{ x: "max-content" }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Replenish;
