import { useEffect } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { Form, Input, Button, Card, Typography } from "antd";
import { UserOutlined as UserIcon, LockOutlined as PasswordIcon } from "@ant-design/icons";

import { useAuthStore } from "../../models/AuthStore";

export const Auth = observer(() => {
  const authStore = useAuthStore();
  const navigate = useNavigate();

  async function attemptLogin(values: { username: string; password: string }) {
    const { username, password } = values;
    await authStore.login(username, password);
    if (authStore.isAuthenticated) navigate("/");
  }

  useEffect(() => {
    if (authStore.isAuthenticated) {
      navigate("/");
      return;
    }
  }, [authStore, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}>
      <Card style={{ width: 400, paddingTop: 20 }}>
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Login
        </Typography.Title>

        <Form name="login_form" layout="vertical" onFinish={attemptLogin} autoComplete="off">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}>
            <Input prefix={<UserIcon />} placeholder="user_example" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}>
            <Input.Password prefix={<PasswordIcon />} placeholder="password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={authStore.isLoading}>
              Enter
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
});
