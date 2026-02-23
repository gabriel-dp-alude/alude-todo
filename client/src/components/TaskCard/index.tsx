import { observer } from "mobx-react-lite";
import { Button, Card, Checkbox, Divider, Form, Input, List, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { TaskInstance } from "../../models/Task";
import { useTodoStore } from "../../models/TodoStore";
import { EditableText } from "../EditableText";
import { SubtaskRow } from "./SubtaskRow";

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
        <EditableText
          text={task.title}
          update={task.rename}
          remove={() => todoStore.removeTask(task.id_task)}
          strong
          delete={task.done}
          style={{ fontSize: 16 }}
        />
        <Checkbox checked={task.done} onChange={task.toggle} disabled={task.isLoading} />
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
        renderItem={(subtask) => <SubtaskRow subtask={subtask} task={task} />}
        size="small"
      />
    </Card>
  );
});
