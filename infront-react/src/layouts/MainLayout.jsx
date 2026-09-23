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
  HomeOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const { Sider, Content, Footer } = Layout;

const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // 👈 新增：判断是否是手机
  const [tabs, setTabs] = useState([{ key: "/welcome" }]);
  const [activeKey, setActiveKey] = useState("/welcome");
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 👈 新增：监听屏幕尺寸变化，手机端自动折叠侧边栏
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleRoleSwitch = async ({ key }) => {
    try {
      const res = await login({ username: key, password: "123456" });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userInfo", JSON.stringify(res.data.userInfo));
      message.success(`已切换为: ${res.data.userInfo.real_name}`);
      window.location.href = "/welcome";
    } catch (error) {
      message.error("切换失败");
    }
  };

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
          key: "/welcome",
          icon: <HomeOutlined />,
          label: <Link to="/welcome">{t("menu.welcome")}</Link>,
        },
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
        key: "/welcome",
        icon: <HomeOutlined />,
        label: <Link to="/welcome">{t("menu.welcome")}</Link>,
      },
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
    if (isMobile) setCollapsed(true); // 手机端点击菜单后自动收起侧边栏
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
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
          zIndex: 100,
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

      {/* 👈 手机端给内容区加左边距，避免被固定的侧边栏遮挡 */}
      <Layout
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: isMobile ? 80 : 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: colorBgContainer,
            height: 50,
            flexShrink: 0,
            padding: "0 10px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            zIndex: 10,
            overflowX: "auto",
          }}
        >
          <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
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
                    navigate(lastTab ? lastTab.key : "/welcome");
                  }
                }
              }}
              items={tabs.map((tab) => ({
                key: tab.key,
                label: t(`menu.${tab.key.substring(1)}`),
                closable: tab.key !== "/welcome",
              }))}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginLeft: 10,
            }}
          >
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
              <Button type="text" icon={<GlobalOutlined />} size="small" />
            </Dropdown>

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
                  gap: 5,
                }}
              >
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#003a70" }}
                />
                {!isMobile && (
                  <span style={{ color: "#003a70" }}>
                    {userInfo.real_name || "系统管理员"}
                  </span>
                )}
              </span>
            </Dropdown>
          </div>
        </div>

        {/* 👈 主内容区：手机端去掉固定高度，允许自然滚动 */}
        <Content
          style={{
            margin: isMobile ? "8px" : "8px 12px",
            padding: isMobile ? 8 : 16,
            borderRadius: 8,
            minHeight: "calc(100vh - 110px)",
            position: "relative",
            overflow: "visible", // 手机上允许页面滚动
            backgroundImage: "url(/bg-main.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.88)",
              zIndex: 0,
            }}
          />
          {!isMobile && (
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
                opacity: 0.1,
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
              VSTU
            </div>
          )}
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                color: "#00b4ff",
                fontSize: "60px",
                opacity: 0.12,
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
              <CarOutlined />
            </div>
          )}

          <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
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
