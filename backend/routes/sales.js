import React, { useState, useEffect } from "react";
import { Card, Input, Button, Table, message, Row, Col, Statistic } from "antd";
import { ScanOutlined, CloudOutlined } from "@ant-design/icons";
import { getProductList } from "../api/product";
import { checkout } from "../api/sales";

const Sales = () => {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    getProductList().then((res) => setAllProducts(res.data));
  }, []);

  const handleScan = (e) => {
    if (e.key === "Enter") {
      const product = allProducts.find((p) => p.id === Number(barcode));
      if (!product) {
        message.error("未找到该商品，请检查条码号！");
      } else if (product.stock <= 0) {
        message.warning("该商品库存不足！");
      } else {
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
          setCart(
            cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          );
        } else {
          setCart([...cart, { ...product, quantity: 1 }]);
        }
        message.success(`已添加: ${product.goods_name}`);
      }
      setBarcode("");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return message.warning("购物车为空");
    try {
      for (const item of cart) {
        await checkout({ goods_id: item.id, quantity: item.quantity });
      }
      message.success("结算成功！库存已扣减");
      setCart([]);
      getProductList().then((res) => setAllProducts(res.data));
    } catch (error) {
      message.error("结算失败，请重试");
    }
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.sell_price * item.quantity,
    0,
  );
  const totalCarbon = cart.reduce(
    (sum, item) => sum + item.carbon_saving * item.quantity,
    0,
  );

  const columns = [
    { title: "商品名称", dataIndex: "goods_name" },
    {
      title: "单价",
      dataIndex: "sell_price",
      render: (text) => `¥${Number(text).toFixed(2)}`,
    },
    { title: "数量", dataIndex: "quantity" },
    {
      title: "小计",
      render: (_, record) =>
        `¥${(record.sell_price * record.quantity).toFixed(2)}`,
    },
  ];

  return (
    // 👈 关键：Row高度100%，内部各自处理滚动
    <Row gutter={16} style={{ height: "100%", overflow: "hidden" }}>
      <Col span={16} style={{ height: "100%" }}>
        <Card
          title="🛒 收银台（模拟扫码枪：输入商品ID后按回车）"
          bordered={false}
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
          bodyStyle={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Input
            size="large"
            placeholder="请扫描商品条码或手动输入ID (例如: 1, 2, 3...)"
            prefix={<ScanOutlined />}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleScan}
            autoFocus
            style={{ marginBottom: 20, flexShrink: 0 }}
          />
          {/* 👈 表格内部滚动 */}
          <Table
            rowKey="id"
            columns={columns}
            dataSource={cart}
            pagination={false}
            scroll={{ y: "calc(100vh - 350px)" }}
          />
        </Card>
      </Col>

      <Col span={8} style={{ height: "100%" }}>
        <Card title="结算信息" bordered={false} style={{ height: "100%" }}>
          <Statistic
            title="本次销售总额"
            value={totalAmount}
            precision={2}
            prefix="¥"
            valueStyle={{ color: "#cf1322", fontSize: 32 }}
          />
          <Statistic
            title="本次碳减排量"
            value={totalCarbon}
            precision={2}
            suffix="kg"
            prefix={<CloudOutlined />}
            style={{ marginTop: 20 }}
            valueStyle={{ color: "#1890ff" }}
          />
          <Button
            type="primary"
            size="large"
            block
            style={{ marginTop: 40, height: 50, fontSize: 18 }}
            onClick={handleCheckout}
          >
            确认收款
          </Button>
        </Card>
      </Col>
    </Row>
  );
};

export default Sales;
