import { observer } from "mobx-react-lite";
import { Button, Card, Checkbox, Divider, Form, Input, List, Space, Typography } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

import { TaskInstance } from "../../models/Task";
import { useTodoStore } from "../../models/TodoStore";

interface TaskCardI {
  task: TaskInstance;
}

export const TaskCard = observer(({ task }: TaskCardI) => {
  const todoStore = useTodoStore();
  const [addSubtaskForm] = Form.useForm();

  async function addSubtask(values: { title: string }) {
    const { title } = values;
    await task.addSubtask(title);
    addSubtaskForm.resetFields();
  }

  return (
    <Card style={{ marginBottom: "1rem", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Typography.Text strong delete={task.done} style={{ fontSize: 16 }}>
          {task.title}
        </Typography.Text>

        <div>
          <Button danger icon={<DeleteOutlined />} onClick={() => todoStore.removeTask(task.id_task)} size="small" />
          <Divider orientation="vertical" />
          <Checkbox checked={task.done} onChange={task.toggle} />
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <Form form={addSubtaskForm} onFinish={addSubtask}>
        <Space.Compact style={{ width: "100%" }}>
          <Form.Item name="title" style={{ flex: 1, marginBottom: "0.5rem" }}>
            <Input placeholder="Add subtask..." />
          </Form.Item>
          <Button htmlType="submit" icon={<PlusOutlined />} />
        </Space.Compact>
      </Form>
      <List
        dataSource={task.subtasks.slice()}
        locale={{ emptyText: " " }}
        loading={task.isLoadingSubtasks}
        renderItem={(subtask) => (
          <List.Item
            key={subtask.id_subtask}
            style={{ padding: "0.5rem 0 0.5rem 1rem" }}
            actions={[
              <Button
                danger
                size="small"
                onClick={() => task.removeSubtask(subtask.id_subtask)}
                icon={<DeleteOutlined />}
              />,
              <Checkbox checked={subtask.done} />,
            ]}>
            <Typography.Text delete={subtask.done}>{subtask.title}</Typography.Text>
          </List.Item>
        )}
        size="small"
      />
    </Card>
  );
});
