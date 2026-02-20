import { observer } from "mobx-react-lite";

import { TaskInstance } from "../../models/Task";

interface TaskCardI {
  task: TaskInstance;
}

export const TaskCard = observer(({ task }: TaskCardI) => {
  return (
    <div style={{ width: "30rem", display: "flex", justifyContent: "space-between", border: "1px solid #000" }}>
      <p>{task.title}</p>
      <input type="checkbox" onClick={task.toggle} value={task.done ? "1" : "0"} />
    </div>
  );
});
