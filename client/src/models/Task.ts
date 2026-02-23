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
    isLoading: false,
    isLoadingSubtasks: false,
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
    setSubtasks(subtasks: SubtaskInstance[]) {
      self.subtasks = cast(subtasks);
    },
    setTitle(title: string) {
      self.title = title;
    },
    setDone(done: boolean) {
      self.done = done;
    },
  }))
  .actions((self) => ({
    toggle: flow(function* () {
      const newState = !self.done;
      self.done = newState;
      self.isLoading = true;
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
      self.isLoading = false;
    }),

    rename: flow(function* (title: string) {
      const original = self.title;
      self.title = title;
      self.isLoading = true;
      yield apiRequest(
        `/tasks/${self.id_task}`,
        {
          method: "PATCH",
          body: {
            title: title,
          },
        },
        {
          onFail: (e) => {
            self.setTitle(original);
          },
        },
      );
      self.isLoading = false;
    }),

    addSubtask: flow(function* (title: string) {
      self.isLoadingSubtasks = true;
      yield apiRequest<SubtaskInstance>(
        `/tasks/${self.id_task}/subtasks`,
        {
          method: "POST",
          body: { title },
        },
        {
          onSuccess: (data) => {
            self.setSubtasks([...self.subtasks, data]);
          },
        },
      );
      self.isLoadingSubtasks = false;
    }),

    removeSubtask: flow(function* removeSubtask(id_subtask) {
      self.isLoadingSubtasks = true;
      const subtask = self.subtasks.find((s) => s.id_subtask === id_subtask);
      if (!subtask) return;
      yield apiRequest(
        `/tasks/${self.id_task}/subtasks/${subtask.id_subtask}`,
        { method: "DELETE" },
        {
          onSuccess: (data) => {
            self.setSubtasks(self.subtasks.filter((s) => s.id_subtask !== subtask.id_subtask));
          },
        },
      );
      self.isLoadingSubtasks = false;
    }),
  }));

export type TaskInstance = Instance<typeof TaskModel>;
