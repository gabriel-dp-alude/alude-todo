import { flow, Instance, types } from "mobx-state-tree";
import { apiRequest } from "../utils/api";

export const SubtaskModel = types
  .model("Subtask", {
    id_subtask: types.identifierNumber,
    id_task: types.integer,
    title: types.string,
    done: types.boolean,
  })
  .actions((self) => ({
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
      yield apiRequest(
        `/tasks/${self.id_task}/subtasks/${self.id_subtask}`,
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

    rename: flow(function* (newTitle: string) {
      const original = self.title;
      self.title = newTitle;
      yield apiRequest(
        `/tasks/${self.id_task}/subtasks/${self.id_subtask}`,
        {
          method: "PATCH",
          body: {
            title: newTitle,
          },
        },
        {
          onFail: (e) => {
            self.setTitle(original);
          },
        },
      );
    }),
  }));

export type SubtaskInstance = Instance<typeof SubtaskModel>;
