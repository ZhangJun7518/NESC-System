import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import ruRU from "antd/locale/ru_RU";
import App from "./App.jsx";
import "./index.css";
import "./i18n"; // 引入多语言配置
import i18n from "i18next";

// 根据当前语言动态获取 AntD 语言包
const getAntdLocale = () => {
  const lang = i18n.language;
  if (lang === "en") return enUS;
  if (lang === "ru") return ruRU;
  return zhCN;
};

// 用一个组件包裹 App，以便在语言变化时重新渲染
const Root = () => {
  // 强制刷新页面时，这里会重新执行，从而拿到最新的语言
  return (
    <ConfigProvider
      locale={getAntdLocale()}
      theme={{ token: { colorPrimary: "#003a70", borderRadius: 6 } }}
    >
      <App />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
