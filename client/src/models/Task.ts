import { Instance, SnapshotOrInstance, SnapshotOut, types } from "mobx-state-tree";

import { ISODateTime } from "./customTypes";
import { SubtaskModel } from "./Subtask";

const TaskModel = types
  .model("Task", {
    id_task: types.identifierNumber,
    title: types.string,
    done: types.boolean,
    subtasks: types.array(SubtaskModel),
    created_at: ISODateTime,
  })
  .views((self) => ({
    // get completedSubtasksCount() {
    //   return self.subtasks.filter((s) => s.done).length;
    // },
    // get isFullyCompleted() {
    //   return self.subtasks.length > 0 && self.completedSubtasksCount === self.subtasks.length;
    // },
    get doneString() {
      return self.done ? "Concluído" : "Pendente";
    },
  }))
  .actions((self) => ({
    toggle() {
      self.done = !self.done;
    },
    addSubtask(title: string) {
      self.subtasks.push({
        id: 1,
        title,
        done: false,
      });
    },
  }));

type Task = SnapshotOrInstance<typeof TaskModel>;
type TaskSnapshot = SnapshotOut<typeof TaskModel>;
type TaskInstance = Instance<typeof TaskModel>;

export { TaskModel };
export type { Task, TaskSnapshot, TaskInstance };
