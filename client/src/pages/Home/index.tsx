import { useEffect } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { Button, Form, Input, List, Space, Typography, Layout, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useTodoStore } from "../../models/TodoStore";
import { useAuthStore } from "../../models/AuthStore";
import { TaskCard } from "../../components/TaskCard";
import UserArea from "../../components/UserArea";
import "./Home.css";

export const Home = observer(() => {
  const [addTaskForm] = Form.useForm();
  const todoStore = useTodoStore();
  const authStore = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authStore.isAuthenticated) {
      navigate("/auth");
      return;
    }
    todoStore.load();
  }, [authStore.isAuthenticated, todoStore, navigate]);

  async function addTask(values: { title: string }) {
    const title = values.title?.trim();
    if (!title) {
      addTaskForm.resetFields();
      return;
    }
    await todoStore.addTask(title);
    addTaskForm.resetFields();
  }

  return (
    <div className="app-container">
      <div className="app-content">
        <div className="header-wrapper">
          <Layout.Header
            style={{
              width: "100%",
              padding: "1rem 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>
              Alude ToDo
            </Typography.Title>
            <UserArea />
          </Layout.Header>

          <Form form={addTaskForm} onFinish={addTask} style={{ width: "100%" }}>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item name="title" style={{ flex: 1 }}>
                <Input placeholder="Add a task..." />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                <PlusOutlined />
              </Button>
            </Space.Compact>
          </Form>

          <Divider style={{ margin: 0 }} />
        </div>

        <List
          dataSource={todoStore.tasks.slice()}
          locale={{ emptyText: "No tasks yet" }}
          style={{ width: "100%", paddingTop: "1rem" }}
          renderItem={(task) => (
            <List.Item key={task.id_task} style={{ padding: 0, border: "none" }}>
              <TaskCard task={task} />
            </List.Item>
          )}
          loading={todoStore.isLoading}
        />
      </div>
    </div>
  );
});
