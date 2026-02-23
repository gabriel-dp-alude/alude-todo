import { useEffect } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { Button, Form, Input, List, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useTodoStore } from "../../models/TodoStore";
import { useAuthStore } from "../../models/AuthStore";
import { TaskCard } from "../../components/TaskCard";

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
    const { title } = values;
    if (!title) return;
    await todoStore.addTask(title);
    addTaskForm.resetFields();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "min(100%, 40rem)",
        padding: "1.5rem",
        margin: "0 auto",
        background: "#f0f2f5",
      }}>
      <Typography.Title level={3} style={{ textAlign: "center" }}>
        Alude ToDo
      </Typography.Title>
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
      <List
        dataSource={todoStore.tasks.slice()}
        locale={{ emptyText: "No tasks yet" }}
        style={{ width: "100%" }}
        renderItem={(task) => (
          <List.Item key={task.id_task} style={{ padding: 0, border: "none" }}>
            <TaskCard task={task} />
          </List.Item>
        )}
        loading={todoStore.isLoading}
      />
    </div>
  );
});
