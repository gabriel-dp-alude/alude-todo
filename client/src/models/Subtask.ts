import { flow, Instance, SnapshotOrInstance, SnapshotOut, types } from "mobx-state-tree";
import { apiRequest } from "../utils/api";

const SubtaskModel = types
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
  .actions((self) => {
    const toggle = flow(function* toggle() {
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
    });
    return { toggle };
  });

type Subtask = SnapshotOrInstance<typeof SubtaskModel>;
type SubtaskSnapshot = SnapshotOut<typeof SubtaskModel>;
type SubtaskInstance = Instance<typeof SubtaskModel>;

export { SubtaskModel };
export type { Subtask, SubtaskInstance, SubtaskSnapshot };
