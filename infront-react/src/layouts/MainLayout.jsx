import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Tabs,
  Dropdown,
  Avatar,
  message,
  theme,
  Button,
} from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  SwapOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  CarOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const { Sider, Content, Footer } = Layout;

const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [tabs, setTabs] = useState([{ key: "/dashboard" }]);
  const [activeKey, setActiveKey] = useState("/dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 演示身份切换
  const handleRoleSwitch = async ({ key }) => {
    try {
      const res = await login({ username: key, password: "123456" });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userInfo", JSON.stringify(res.data.userInfo));
      message.success(`已切换为: ${res.data.userInfo.real_name}`);
      window.location.href = "/dashboard";
    } catch (error) {
      message.error("切换失败");
    }
  };

  // 语言切换
  const handleLanguageChange = async ({ key }) => {
    await i18n.changeLanguage(key);
    localStorage.setItem("lang", key);
    window.location.reload();
  };

  const getMenuItems = () => {
    const role = userInfo.role;
    if (role === "stocker") {
      return [
        {
          key: "/sales",
          icon: <ShoppingCartOutlined />,
          label: <Link to="/sales">{t("menu.sales")}</Link>,
        },
      ];
    }
    if (role === "admin" || role === "hq_leader") {
      return [
        {
          key: "/dashboard",
          icon: <DashboardOutlined />,
          label: <Link to="/dashboard">{t("menu.dashboard")}</Link>,
        },
        {
          key: "/product",
          icon: <AppstoreOutlined />,
          label: <Link to="/product">{t("menu.product")}</Link>,
        },
        {
          key: "/sales",
          icon: <ShoppingCartOutlined />,
          label: <Link to="/sales">{t("menu.sales")}</Link>,
        },
        {
          key: "/transfer",
          icon: <SwapOutlined />,
          label: <Link to="/transfer">{t("menu.transfer")}</Link>,
        },
        {
          key: "/system",
          icon: <SettingOutlined />,
          label: <Link to="/system">{t("menu.system")}</Link>,
        },
      ];
    }
    return [
      {
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">{t("menu.dashboard")}</Link>,
      },
      {
        key: "/product",
        icon: <AppstoreOutlined />,
        label: <Link to="/product">{t("menu.product")}</Link>,
      },
      {
        key: "/sales",
        icon: <ShoppingCartOutlined />,
        label: <Link to="/sales">{t("menu.sales")}</Link>,
      },
      {
        key: "/transfer",
        icon: <SwapOutlined />,
        label: <Link to="/transfer">{t("menu.transfer")}</Link>,
      },
    ];
  };

  const onMenuClick = ({ key }) => {
    if (!tabs.find((tab) => tab.key === key)) {
      setTabs([...tabs, { key }]);
    }
    setActiveKey(key);
    navigate(key);
  };

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveKey(location.pathname);
    }
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        style={{
          background: "#001529",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: 64,
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 16,
            fontWeight: "bold",
            background: "#002140",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {collapsed ? "NESC" : t("app_name")}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={getMenuItems()}
          onClick={onMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout style={{ display: "flex", flexDirection: "column" }}>
        {/* 👈 Header 与 Tabs 合并 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: colorBgContainer,
            height: 50,
            flexShrink: 0,
            padding: "0 20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            zIndex: 10,
          }}
        >
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Tabs
              type="editable-card"
              hideAdd
              activeKey={activeKey}
              onChange={(key) => {
                setActiveKey(key);
                navigate(key);
              }}
              onEdit={(targetKey, action) => {
                if (action === "remove") {
                  const newTabs = tabs.filter((tab) => tab.key !== targetKey);
                  setTabs(newTabs);
                  if (activeKey === targetKey) {
                    const lastTab = newTabs[newTabs.length - 1];
                    navigate(lastTab ? lastTab.key : "/dashboard");
                  }
                }
              }}
              items={tabs.map((tab) => ({
                key: tab.key,
                label: t(`menu.${tab.key.substring(1)}`),
                closable: tab.key !== "/dashboard",
              }))}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* 👈 右上角：语言切换 + 系统管理员 */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginLeft: 20,
            }}
          >
            {/* 语言切换 */}
            <Dropdown
              menu={{
                items: [
                  { key: "zh", label: "🇨🇳 中文" },
                  { key: "en", label: "🇬🇧 English" },
                  { key: "ru", label: "🇷🇺 Русский" },
                ],
                onClick: handleLanguageChange,
              }}
            >
              <Button type="text" icon={<GlobalOutlined />} size="small">
                {i18n.language === "zh"
                  ? "中文"
                  : i18n.language === "en"
                    ? "English"
                    : "Русский"}
              </Button>
            </Dropdown>

            {/* 系统管理员下拉菜单 */}
            <Dropdown
              menu={{
                items: [
                  { key: "admin", label: "系统管理员 (admin)" },
                  { key: "hq_leader", label: "总部领导 (hq_leader)" },
                  { key: "store_1", label: "A店店长 (store_1)" },
                  { key: "stock_1", label: "A店理货员 (stock_1)" },
                  { type: "divider" },
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: t("header.logout"),
                    onClick: () => {
                      localStorage.clear();
                      window.location.href = "/login";
                    },
                  },
                ],
                onClick: (info) => {
                  if (info.key !== "logout") handleRoleSwitch(info);
                },
              }}
            >
              <span
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#003a70" }}
                />
                <span style={{ color: "#003a70" }}>
                  {userInfo.real_name || "系统管理员"}
                </span>
              </span>
            </Dropdown>
          </div>
        </div>

        {/* 👈 主内容区：调整遮罩为半透明，透出背景图 */}
        <Content
          style={{
            margin: "8px 12px",
            padding: 8,
            borderRadius: 8,
            minHeight: "calc(100vh - 110px)",
            position: "relative",
            overflow: "hidden",
            backgroundImage: "url(/bg-main.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          {/* 👈 核心调整：遮罩层变为半透明，透出背景图 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.75)", // 透明度从 0.92 降到 0.75，背景图隐约可见
              backdropFilter: "blur(4px)",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#003a70",
              fontSize: "20px",
              fontWeight: "bold",
              letterSpacing: "4px",
              opacity: 0.15,
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            VSTU
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              color: "#00b4ff",
              fontSize: "60px",
              opacity: 0.15,
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <CarOutlined />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              overflow: "auto",
            }}
          >
            <Outlet />
          </div>
        </Content>

        <Footer
          style={{
            textAlign: "center",
            color: "#999",
            fontSize: "12px",
            background: "transparent",
            padding: "5px 0",
          }}
        >
          © 2026 张军 | 维捷布斯克国立技术大学 (VSTU)
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
