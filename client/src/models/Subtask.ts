import { Instance, SnapshotOrInstance, SnapshotOut, types } from "mobx-state-tree";

const SubtaskModel = types
  .model("Subtask", {
    id: types.identifierNumber,
    title: types.string,
    done: types.boolean,
  })
  .actions((self) => ({
    toggle() {
      self.done = !self.done;
    },
  }));

type Subtask = SnapshotOrInstance<typeof SubtaskModel>;
type SubtaskSnapshot = SnapshotOut<typeof SubtaskModel>;
type SubtaskInstance = Instance<typeof SubtaskModel>;

export { SubtaskModel };
export type { Subtask, SubtaskInstance, SubtaskSnapshot };
