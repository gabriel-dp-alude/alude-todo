import { useRef } from "react";
import { observer } from "mobx-react-lite";

import { TaskInstance } from "../../models/Task";

interface TaskCardI {
  task: TaskInstance;
}

export const TaskCard = observer(({ task }: TaskCardI) => {
  const subtaskTitleInputRef = useRef<HTMLInputElement>(null);

  async function handleAddSubtask() {
    if (!subtaskTitleInputRef.current) return;
    const title = subtaskTitleInputRef.current.value;
    await task.addSubtask(title);
    subtaskTitleInputRef.current.value = "";
  }

  return (
    <div style={{ width: "30rem", border: "1px solid #000" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <p>{task.title}</p>
        <input type="checkbox" onClick={task.toggle} checked={task.done} />
      </div>
      <div>
        <input type="text" ref={subtaskTitleInputRef} />
        <button onClick={handleAddSubtask}>Add Subtask</button>
      </div>
      <div>
        {task.subtasks.map((s) => (
          <p>- {s.title}</p>
        ))}
      </div>
    </div>
  );
});
