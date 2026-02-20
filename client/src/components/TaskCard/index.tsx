import { useRef } from "react";
import { observer } from "mobx-react-lite";

import { TaskInstance } from "../../models/Task";
import { useTodoStore } from "../../models/TodoStore";

interface TaskCardI {
  task: TaskInstance;
}

export const TaskCard = observer(({ task }: TaskCardI) => {
  const todoStore = useTodoStore();
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
        <input type="checkbox" onChange={task.toggle} checked={task.done} />
      </div>
      <div>
        <input type="text" ref={subtaskTitleInputRef} />
        <button onClick={handleAddSubtask}>Add Subtask</button>
        <button onClick={() => todoStore.removeTask(task.id_task)}>Delete Task</button>
      </div>
      <div>
        {task.subtasks.map((subtask) => (
          <div key={subtask.id_subtask} style={{ display: "flex", justifyContent: "space-between" }}>
            <p>- {subtask.title}</p>
            <button onClick={() => task.removeSubtask(subtask.id_subtask)}>Delete Subtask</button>
            <input type="checkbox" onChange={subtask.toggle} checked={subtask.done} />
          </div>
        ))}
      </div>
    </div>
  );
});
