import React, { useState, useEffect } from "react";
import { Card, Input, Button, Table, message, Row, Col, Statistic } from "antd";
import { ScanOutlined, CloudOutlined } from "@ant-design/icons";
import { getProductList } from "../api/product";
import { checkout } from "../api/sales";
import { useTranslation } from "react-i18next";

const Sales = () => {
  const { t, i18n } = useTranslation();
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
        message.error(t("sales.not_found") || "未找到该商品");
      } else if (product.stock <= 0) {
        message.warning(t("sales.out_of_stock") || "库存不足");
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
        message.success((t("sales.added") || "已添加: ") + product.goods_name);
      }
      setBarcode("");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0)
      return message.warning(t("sales.empty_cart") || "购物车为空");
    try {
      for (const item of cart) {
        await checkout({ goods_id: item.id, quantity: item.quantity });
      }
      message.success(t("sales.checkout_success") || "结算成功！");
      setCart([]);
      getProductList().then((res) => setAllProducts(res.data));
    } catch (error) {
      message.error(t("sales.checkout_fail") || "结算失败");
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
    { title: t("product.name") || "商品名称", dataIndex: "goods_name" },
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
    <Row gutter={16} style={{ height: "100%", overflow: "hidden" }}>
      <Col span={16} style={{ height: "100%" }}>
        <Card
          title={t("sales.title") || "🛒 收银台"}
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
            placeholder={t("sales.placeholder") || "请输入商品ID"}
            prefix={<ScanOutlined />}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleScan}
            autoFocus
            style={{ marginBottom: 20, flexShrink: 0 }}
          />
          {/* 👈 核心修复：key={i18n.language} */}
          <Table
            key={i18n.language}
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
            title={t("sales.total") || "本次销售总额"}
            value={totalAmount}
            precision={2}
            prefix="¥"
            valueStyle={{ color: "#cf1322", fontSize: 32 }}
          />
          <Statistic
            title={t("sales.carbon") || "本次碳减排量"}
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
            {t("sales.checkout") || "确认收款"}
          </Button>
        </Card>
      </Col>
    </Row>
  );
};
export default Sales;
