import { observer } from "mobx-react-lite";
import { Checkbox, List } from "antd";

import { SubtaskInstance } from "../../models/Subtask";
import { TaskInstance } from "../../models/Task";
import { EditableText } from "../EditableText";

interface SubtaskRowI {
  subtask: SubtaskInstance;
  task: TaskInstance;
}

export const SubtaskRow = observer(({ subtask, task }: SubtaskRowI) => (
  <List.Item
    style={{ padding: "0.5rem 0 0.5rem 1rem" }}
    actions={[<Checkbox checked={subtask.done} onChange={() => subtask.toggle()} />]}>
    <EditableText
      text={subtask.title}
      update={subtask.rename}
      remove={() => task.removeSubtask(subtask.id_subtask)}
      delete={subtask.done}
    />
  </List.Item>
));
