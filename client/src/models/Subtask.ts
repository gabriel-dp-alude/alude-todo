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
    setDone(done: boolean) {
      self.done = done;
    },
  }))
  .actions((self) => ({
    toggle: flow(function* toggle() {
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
  }));

export type SubtaskInstance = Instance<typeof SubtaskModel>;
