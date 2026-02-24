import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { Form, Input, Button, Card, Typography, Divider } from "antd";
import { UserOutlined as UserIcon, LockOutlined as PasswordIcon } from "@ant-design/icons";

import { useAuthStore } from "../../models/AuthStore";

export const Auth = observer(() => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form] = Form.useForm();

  async function handleSubmit(values: { username: string; password: string; confirmPassword?: string }) {
    const { username, password } = values;

    if (mode === "login") {
      await authStore.login(username, password);
      if (authStore.isAuthenticated) navigate("/");
    } else {
      const result = await authStore.register(username, password);
      if (result) setMode("login");
    }
  }

  useEffect(() => {
    if (authStore.isAuthenticated) {
      navigate("/");
    }
  }, [authStore.isAuthenticated, navigate]);

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
          {mode === "login" ? "Login" : "Register"}
        </Typography.Title>

        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off" requiredMark={false}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}>
            <Input prefix={<UserIcon />} placeholder="user_example" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Minimum 6 characters" },
            ]}>
            <Input.Password prefix={<PasswordIcon />} placeholder="password" />
          </Form.Item>

          {mode === "register" && (
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}>
              <Input.Password prefix={<PasswordIcon />} placeholder="confirm password" />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={authStore.isLoading}>
              {mode === "login" ? "Enter" : "Create Account"}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: "12px 0" }} />

        <Typography.Text style={{ display: "block", textAlign: "center" }}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <Button
            type="link"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              form.resetFields();
            }}
            style={{ padding: "0 0.25rem" }}>
            {mode === "login" ? "Register" : "Login"}
          </Button>
        </Typography.Text>
      </Card>
    </div>
  );
});
