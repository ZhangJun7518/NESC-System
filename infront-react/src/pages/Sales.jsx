/**
 * 收银台页面
 * 核心功能：模拟扫码枪输入ID -> 加入购物车 -> 确认收款（触发后端扣减库存与碳减排计算）
 * 适配：移动端响应式布局，左右两栏在手机上自动堆叠，表格允许横向滑动
 */
import React, { useState, useEffect } from "react";
import { Card, Input, Button, Table, message, Row, Col, Statistic } from "antd";
import { ScanOutlined, CloudOutlined } from "@ant-design/icons";
import { getProductList } from "../api/product";
import { checkout } from "../api/sales";
import { useTranslation } from "react-i18next";

const Sales = () => {
  const { t, i18n } = useTranslation();

  // ==================== 状态定义 ====================
  const [barcode, setBarcode] = useState(""); // 扫码枪输入的ID
  const [cart, setCart] = useState([]); // 购物车数据
  const [allProducts, setAllProducts] = useState([]); // 当前门店所有商品（用于校验库存和价格）

  // 页面加载时预加载当前门店的商品
  useEffect(() => {
    getProductList().then((res) => setAllProducts(res.data));
  }, []);

  // ==================== 业务逻辑处理 ====================
  // 监听输入框回车事件（扫码枪本质是快速输入+回车）
  const handleScan = (e) => {
    if (e.key === "Enter") {
      const product = allProducts.find((p) => p.id === Number(barcode));

      if (!product) {
        message.error(t("sales.not_found") || "未找到该商品，请检查条码号！");
      } else if (product.stock <= 0) {
        message.warning(t("sales.out_of_stock") || "该商品库存不足！");
      } else {
        // 如果购物车里已有该商品，数量+1；否则新增一行
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
      setBarcode(""); // 清空输入框，准备下一次扫码
    }
  };

  // 确认收款
  const handleCheckout = async () => {
    if (cart.length === 0)
      return message.warning(t("sales.empty_cart") || "购物车为空");
    try {
      // 遍历购物车，逐条调用后端结算接口
      for (const item of cart) {
        await checkout({ goods_id: item.id, quantity: item.quantity });
      }
      message.success(t("sales.checkout_success") || "结算成功！库存已扣减");
      setCart([]); // 清空购物车
      getProductList().then((res) => setAllProducts(res.data)); // 刷新商品列表，更新库存
    } catch (error) {
      message.error(t("sales.checkout_fail") || "结算失败，请重试");
    }
  };

  // ==================== 金额计算 ====================
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.sell_price * item.quantity,
    0,
  ); // 总金额
  const totalCarbon = cart.reduce(
    (sum, item) => sum + item.carbon_saving * item.quantity,
    0,
  ); // 总碳减排量

  // ==================== 表格列定义 ====================
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

  // ==================== 页面渲染 ====================
  return (
    // 👈 移动端适配：去掉了固定的 height 和 overflow，改用响应式 gutter
    <Row gutter={[16, 16]}>
      {/* 左侧：扫码与购物车。在电脑上占 16 份宽，手机上占 24 份宽（占满整行） */}
      <Col xs={24} md={16}>
        <Card title={t("sales.title") || "🛒 收银台"} bordered={false}>
          <Input
            size="large"
            placeholder={t("sales.placeholder") || "请扫描商品条码或手动输入ID"}
            prefix={<ScanOutlined />}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleScan}
            autoFocus
            style={{ marginBottom: 20 }}
          />
          {/* 👈 手机端表格：允许横向滑动，去掉内部纵向滚动限制 */}
          <Table
            key={i18n.language}
            rowKey="id"
            columns={columns}
            dataSource={cart}
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </Col>

      {/* 右侧：结算卡片。在电脑上占 8 份宽，手机上占 24 份宽（占满整行） */}
      <Col xs={24} md={8}>
        <Card title="结算信息" bordered={false}>
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
