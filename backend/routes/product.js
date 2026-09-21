import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Tag,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  QrcodeOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import {
  getProductList,
  addProduct,
  deleteProduct,
  stockIn,
} from "../api/product";
import { getSalesList } from "../api/sales";
import AuthButton from "../components/AuthButton";

const Product = () => {
  const [data, setData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [currentGoods, setCurrentGoods] = useState(null);
  const [form] = Form.useForm();
  const [stockInForm] = Form.useForm();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProductList();
      setData(res.data);
    } catch (error) {
      message.error("获取商品列表失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await getSalesList();
      setSalesData(res.data);
    } catch (error) {
      console.error("获取销售记录失败");
    }
  };

  useEffect(() => {
    fetchData();
    fetchSales();
  }, []);

  const handleAdd = async (values) => {
    try {
      if (userInfo.role === "store_manager")
        values.store_id = userInfo.store_id;
      await addProduct(values);
      message.success("添加成功");
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error("添加失败");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success("删除成功");
      fetchData();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleStockIn = async (values) => {
    try {
      await stockIn({ goods_id: currentGoods.id, quantity: values.quantity });
      message.success("入库成功");
      setIsStockInOpen(false);
      stockInForm.resetFields();
      fetchData();
    } catch (error) {
      message.error("入库失败");
    }
  };

  const productColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "商品名称", dataIndex: "goods_name", key: "goods_name" },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    { title: "规格", dataIndex: "spec", key: "spec" },
    {
      title: "售价 (¥)",
      dataIndex: "sell_price",
      key: "sell_price",
      render: (text) => Number(text).toFixed(2),
    },
    {
      title: "当前库存",
      dataIndex: "stock",
      key: "stock",
      render: (text, record) => {
        const isWarning = text <= record.warning_num;
        return (
          <span
            style={{ color: isWarning ? "red" : "green", fontWeight: "bold" }}
          >
            {text}
          </span>
        );
      },
    },
    { title: "预警值", dataIndex: "warning_num", key: "warning_num" },
    { title: "碳减排(kg)", dataIndex: "carbon_saving", key: "carbon_saving" },
    {
      title: "所属门店",
      dataIndex: "store_id",
      key: "store_id",
      render: (text) => (text === 1 ? "A店" : "B店"),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <AuthButton
            permission="product:stock_in"
            type="link"
            icon={<ImportOutlined />}
            onClick={() => {
              setCurrentGoods(record);
              setIsStockInOpen(true);
            }}
          >
            入库
          </AuthButton>
          <Button
            type="link"
            icon={<QrcodeOutlined />}
            onClick={() =>
              message.info(`正在生成 ${record.goods_name} 的二维码...`)
            }
          >
            条码
          </Button>
          <AuthButton
            permission="product:delete"
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
          >
            删除
          </AuthButton>
        </Space>
      ),
    },
  ];

  const salesColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "商品名称", dataIndex: "goods_name", key: "goods_name" },
    { title: "销售数量", dataIndex: "quantity", key: "quantity" },
    {
      title: "销售总额 (¥)",
      dataIndex: "total_price",
      key: "total_price",
      render: (text) => Number(text).toFixed(2),
    },
    {
      title: "碳减排量 (kg)",
      dataIndex: "carbon_saving_total",
      key: "carbon_saving_total",
    },
    { title: "销售时间", dataIndex: "sale_time", key: "sale_time" },
    {
      title: "门店",
      dataIndex: "store_id",
      key: "store_id",
      render: (text) => (text === 1 ? "A店" : "B店"),
    },
  ];

  return (
    // 👈 关键：让Card占满高度，Tabs强制撑满
    <Card
      bordered={false}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      bodyStyle={{ flex: 1, overflow: "hidden", padding: 0 }}
    >
      <Tabs
        defaultActiveKey="1"
        style={{ height: "100%" }}
        items={[
          {
            key: "1",
            label: "商品列表",
            children: (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  padding: "0 16px",
                }}
              >
                <AuthButton
                  permission="product:add"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalOpen(true)}
                  style={{ marginBottom: 16, flexShrink: 0, width: 120 }}
                >
                  新增商品
                </AuthButton>
                {/* 👈 表格内部滚动 */}
                <Table
                  rowKey="id"
                  columns={productColumns}
                  dataSource={data}
                  loading={loading}
                  pagination={false}
                  scroll={{ y: "calc(100vh - 330px)" }}
                />
              </div>
            ),
          },
          {
            key: "2",
            label: "销售记录",
            children: (
              <Table
                rowKey="id"
                columns={salesColumns}
                dataSource={salesData}
                pagination={false}
                scroll={{ y: "calc(100vh - 300px)" }}
                style={{ padding: "0 16px" }}
              />
            ),
          },
        ]}
      />

      {/* 新增商品弹窗 */}
      <Modal
        title="新增商品"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="goods_name"
            label="商品名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="spec" label="规格">
            <Input />
          </Form.Item>
          <Form.Item name="purchase_price" label="进货价">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item
            name="sell_price"
            label="售价"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input />
          </Form.Item>
          <Form.Item name="stock" label="初始库存" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item
            name="warning_num"
            label="预警数量"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item name="carbon_saving" label="碳减排系数(kg/件)">
            <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
          </Form.Item>
          {userInfo.role === "admin" && (
            <Form.Item
              name="store_id"
              label="所属门店"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 1, label: "A店" },
                  { value: 2, label: "B店" },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 入库弹窗 */}
      <Modal
        title={`商品入库 - ${currentGoods?.goods_name || ""}`}
        open={isStockInOpen}
        onOk={() => stockInForm.submit()}
        onCancel={() => setIsStockInOpen(false)}
        okText="确认入库"
      >
        <Form form={stockInForm} layout="vertical" onFinish={handleStockIn}>
          <Form.Item label="当前库存">
            <InputNumber
              value={currentGoods?.stock}
              disabled
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="入库数量"
            rules={[{ required: true, message: "请输入入库数量" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Product;
