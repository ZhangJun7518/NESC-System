import React from "react";
import { Button } from "antd";
import { hasPermission } from "../utils/permission";

// 没有权限时，按钮会自动隐藏（也可以改成 disabled 变灰）
const AuthButton = ({ permission, children, ...props }) => {
  if (!hasPermission(permission)) {
    return null; // 隐藏按钮
  }
  return <Button {...props}>{children}</Button>;
};

export default AuthButton;
