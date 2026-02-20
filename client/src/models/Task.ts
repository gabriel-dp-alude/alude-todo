import { flow, Instance, SnapshotOrInstance, SnapshotOut, types } from "mobx-state-tree";

import { ISODateTime } from "./_customTypes";
import { Subtask, SubtaskModel } from "./Subtask";
import { apiRequest } from "../utils/api";

const TaskModel = types
  .model("Task", {
    id_task: types.identifierNumber,
    title: types.string,
    done: types.boolean,
    subtasks: types.array(SubtaskModel),
    created_at: ISODateTime,
  })
  .views((self) => ({
    get isFullyCompleted() {
      return self.subtasks.length > 0 && self.subtasks.filter((s) => s.done).length === self.subtasks.length;
    },
    get doneString() {
      return self.done ? "Concluído" : "Pendente";
    },
  }))
  .actions((self) => ({
    setDone(done: boolean) {
      self.done = done;
    },
  }))
  .actions((self) => {
    const toggle = flow(function* toggle() {
      const newState = !self.done;
      self.done = newState;
      yield apiRequest(
        `/tasks/${self.id_task}`,
        {
          method: "PATCH",
          body: {
            done: newState,
          },
        },
        {
          onFail: (e) => {
            self.setDone(!newState);
          },
        },
      );
    });
    const addSubtask = flow(function* addSubtask(title: string) {
      const subtask: Subtask = yield apiRequest<Subtask>(`/tasks/${self.id_task}/subtasks`, {
        method: "POST",
        body: { title },
      });
      self.subtasks.push(subtask);
    });
    return { toggle, addSubtask };
  });

type Task = SnapshotOrInstance<typeof TaskModel>;
type TaskSnapshot = SnapshotOut<typeof TaskModel>;
type TaskInstance = Instance<typeof TaskModel>;

export { TaskModel };
export type { Task, TaskSnapshot, TaskInstance };
