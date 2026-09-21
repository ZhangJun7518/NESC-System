import React, { useState, useEffect } from "react";
import { Card, Table, Button, message, Tag, Space } from "antd";
import {
  ReloadOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { getSystemLogs, generateMockData } from "../api/system";
import AuthButton from "../components/AuthButton";
import { useTranslation } from "react-i18next";

const System = () => {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getSystemLogs();
      setLogs(res.data);
    } catch (error) {
      message.error("获取日志失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleGenerateMock = async () => {
    try {
      await generateMockData();
      message.success(t("system.gen_success") || "已生成测试数据");
    } catch (error) {
      message.error(t("system.gen_fail") || "生成失败");
    }
  };

  // 假按钮的提示
  const handleFeatureDev = (featureName) => {
    message.info(`【${featureName}】功能正在开发中，敬请期待...`);
  };

  const columns = [
    { title: t("system.id") || "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: t("system.user") || "操作人",
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("system.type") || "操作类型",
      dataIndex: "action",
      key: "action",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: t("system.detail") || "操作详情",
      dataIndex: "details",
      key: "details",
    },
    {
      title: t("system.time") || "操作时间",
      dataIndex: "create_time",
      key: "create_time",
    },
  ];

  return (
    <Card
      title={t("system.title") || "系统审计日志"}
      size="small"
      bordered={false}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      bodyStyle={{ flex: 1, overflow: "hidden", padding: 0 }}
      extra={
        <AuthButton
          permission="system:reset"
          type="primary"
          danger
          size="small"
          onClick={handleGenerateMock}
        >
          {t("system.generate") || "一键生成测试数据"}
        </AuthButton>
      }
    >
      {/* 👈 刷新日志 + 假系统设置按钮 */}
      <Space style={{ margin: "12px 16px", flexWrap: "wrap" }}>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchLogs}
          size="small"
        >
          {t("system.refresh") || "刷新日志"}
        </Button>
        <Button
          icon={<DatabaseOutlined />}
          size="small"
          onClick={() => handleFeatureDev("数据备份")}
        >
          数据备份
        </Button>
        <Button
          icon={<SafetyCertificateOutlined />}
          size="small"
          onClick={() => handleFeatureDev("权限管理")}
        >
          权限管理
        </Button>
        <Button
          icon={<ToolOutlined />}
          size="small"
          onClick={() => handleFeatureDev("系统参数")}
        >
          系统参数
        </Button>
      </Space>

      <Table
        key={i18n.language}
        rowKey="id"
        columns={columns}
        dataSource={logs}
        loading={loading}
        pagination={false}
        scroll={{ y: "calc(100vh - 350px)" }}
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};
export default System;
