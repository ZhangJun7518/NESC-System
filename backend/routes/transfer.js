import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  message,
  Row,
  Col,
  Modal,
  Form,
  Select,
  InputNumber,
  Space,
  Tabs,
} from "antd";
import { SwapOutlined, HistoryOutlined } from "@ant-design/icons";
import {
  getTransferResources,
  executeTransfer,
  getTransferRecords,
} from "../api/transfer";

const Transfer = () => {
  const [data, setData] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTransferResources();
      setData(res.data);
    } catch (error) {
      message.error("获取资源失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await getTransferRecords();
      setRecords(res.data);
    } catch (error) {
      console.error("获取调拨记录失败");
    }
  };

  useEffect(() => {
    fetchData();
    fetchRecords();
  }, []);

  const handleOpenModal = (record) => {
    setCurrentRecord(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      to_store_id: record.store_id === 1 ? 2 : 1,
      quantity: 1,
    });
  };

  const handleTransfer = async (values) => {
    try {
      await executeTransfer({
        from_store_id: currentRecord.store_id,
        to_store_id: values.to_store_id,
        goods_id: currentRecord.id,
        quantity: values.quantity,
      });
      message.success("调拨执行成功！库存已更新");
      setIsModalOpen(false);
      fetchData();
      fetchRecords();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { title: "商品名称", dataIndex: "goods_name", key: "goods_name" },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: "所属门店",
      dataIndex: "store_id",
      key: "store_id",
      render: (text) => (
        <Tag color={text === 1 ? "blue" : "green"}>
          {text === 1 ? "A店" : "B店"}
        </Tag>
      ),
    },
    {
      title: "当前库存",
      dataIndex: "stock",
      key: "stock",
      render: (text) => <span style={{ fontWeight: "bold" }}>{text}</span>,
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<SwapOutlined />}
          onClick={() => handleOpenModal(record)}
        >
          发起调拨
        </Button>
      ),
    },
  ];

  const recordColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "操作人", dataIndex: "operator_name", key: "operator_name" },
    { title: "调拨详情", dataIndex: "details", key: "details" },
    {
      title: "操作时间",
      dataIndex: "create_time",
      key: "create_time",
      width: 200,
    },
  ];

  return (
    <Row gutter={16} style={{ height: "100%", overflow: "hidden" }}>
      <Col span={24} style={{ height: "100%" }}>
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
                label: "发起调拨",
                children: (
                  <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    pagination={false}
                    scroll={{ y: "calc(100vh - 320px)" }}
                    style={{ padding: "0 16px" }}
                  />
                ),
              },
              {
                key: "2",
                label: (
                  <span>
                    <HistoryOutlined /> 调拨记录
                  </span>
                ),
                children: (
                  <Table
                    rowKey="id"
                    columns={recordColumns}
                    dataSource={records}
                    pagination={false}
                    scroll={{ y: "calc(100vh - 320px)" }}
                    style={{ padding: "0 16px" }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </Col>

      <Modal
        title={`发起调拨 - ${currentRecord?.goods_name || ""}`}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText="确认调拨"
      >
        <Form form={form} layout="vertical" onFinish={handleTransfer}>
          <Form.Item label="来源门店">
            <InputNumber
              value={currentRecord?.store_id}
              disabled
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="to_store_id"
            label="目标门店"
            rules={[{ required: true, message: "请选择目标门店" }]}
          >
            <Select
              options={[
                { value: 1, label: "A店" },
                { value: 2, label: "B店" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="调拨数量"
            rules={[{ required: true, message: "请输入调拨数量" }]}
          >
            <InputNumber
              min={1}
              max={currentRecord?.stock || 1}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <div style={{ color: "#888", fontSize: "12px" }}>
            * 如果目标门店没有该商品，系统将自动在目标门店创建该商品并增加库存。
          </div>
        </Form>
      </Modal>
    </Row>
  );
};

export default Transfer;
