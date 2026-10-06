import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm(); // 👈 新增：表单实例
  const navigate = useNavigate();

  // 👈 新增：进入登录页时，检查是否有预填的用户名
  useEffect(() => {
    const prefill = localStorage.getItem("prefill_username");
    if (prefill) {
      form.setFieldsValue({ username: prefill, password: "123456" });
      localStorage.removeItem("prefill_username"); // 用完即删
    }
  }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await login(values);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userInfo", JSON.stringify(res.data.userInfo));
      // 👈 保存原始登录用户，用于切换角色后恢复
      localStorage.setItem("originalUser", JSON.stringify(res.data.userInfo));
      message.success("登录成功");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/4468754-uhd_3840_2160_24fps.mp4" type="video/mp4" />
        您的浏览器不支持 HTML5 视频。
      </video>
      <div className="video-overlay"></div>

      <div className="login-card">
        <div className="login-title">{t("login.title")}</div>
        {/* 👈 绑定 form 实例 */}
        <Form form={form} name="login" onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("login.username")}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("login.password")}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%", backgroundColor: "#003a70" }}
              loading={loading}
            >
              {t("login.login_btn")}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              message.info("请联系系统管理员重置密码");
            }}
          >
            {t("login.forgot")}
          </a>
        </div>
        <div
          style={{
            textAlign: "center",
            color: "#00b4ff",
            fontSize: "12px",
            opacity: 0.8,
          }}
        >
          {t("login.designer")}
        </div>
      </div>
    </div>
  );
};

export default Login;
