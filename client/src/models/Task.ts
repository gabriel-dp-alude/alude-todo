import { cast, flow, Instance, types } from "mobx-state-tree";

import { apiRequest } from "../utils/api";
import { ISODateTime } from "./_customTypes";
import { SubtaskModel, SubtaskInstance } from "./Subtask";

export const TaskModel = types
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
  .actions((self) => ({
    toggle: flow(function* toggle() {
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
    }),
    addSubtask: flow(function* addSubtask(title: string) {
      const subtask: SubtaskInstance = yield apiRequest<SubtaskInstance>(`/tasks/${self.id_task}/subtasks`, {
        method: "POST",
        body: { title },
      });
      self.subtasks.push(subtask);
    }),
    removeSubtask: flow(function* removeSubtask(id_subtask) {
      const subtask = self.subtasks.find((s) => s.id_subtask === id_subtask);
      if (!subtask) return;
      yield apiRequest(`/tasks/${self.id_task}/subtasks/${subtask.id_subtask}`, { method: "DELETE" });
      self.subtasks = cast(self.subtasks.filter((s) => s.id_subtask !== subtask.id_subtask));
    }),
  }));

export type TaskInstance = Instance<typeof TaskModel>;
