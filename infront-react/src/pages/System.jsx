/**
 * 系统设置与审计日志页面
 * 功能：
 * 1. 查看系统操作日志（谁在什么时间做了什么）
 * 2. 管理员专属：一键生成模拟销售数据（用于答辩救场）
 * 3. 数据备份、权限管理、系统参数等入口（预留占位）
 */
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

  // 获取审计日志
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

  // 一键生成测试数据（救场神技）
  const handleGenerateMock = async () => {
    try {
      await generateMockData();
      message.success(t("system.gen_success") || "已生成测试数据");
    } catch (error) {
      message.error(t("system.gen_fail") || "生成失败");
    }
  };

  // 功能开发中提示
  const handleFeatureDev = (featureName) => {
    message.info(
      `${featureName} - ${t("system.dev_tip") || "功能正在开发中，敬请期待..."}`,
    );
  };

  // 日志表格列（表头使用多语言）
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
      title={t("system.title") || "系统设置与审计日志"}
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
      {/* 工具栏 */}
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
          onClick={() => handleFeatureDev(t("system.backup") || "数据备份")}
        >
          {t("system.backup") || "数据备份"}
        </Button>
        <Button
          icon={<SafetyCertificateOutlined />}
          size="small"
          onClick={() => handleFeatureDev(t("system.permission") || "权限管理")}
        >
          {t("system.permission") || "权限管理"}
        </Button>
        <Button
          icon={<ToolOutlined />}
          size="small"
          onClick={() => handleFeatureDev(t("system.params") || "系统参数")}
        >
          {t("system.params") || "系统参数"}
        </Button>
      </Space>

      {/* 日志表格：key={i18n.language} 保证切换语言时表头同步刷新 */}
      <Table
        key={i18n.language}
        rowKey="id"
        columns={columns}
        dataSource={logs}
        loading={loading}
        pagination={{ pageSize: 15, size: "small" }}
        scroll={{ x: "max-content", y: "calc(100vh - 380px)" }}
      />
    </Card>
  );
};

export default System;
