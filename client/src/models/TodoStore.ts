import { cast, flow, Instance, types } from "mobx-state-tree";

import { Task, TaskModel } from "./Task";
import { apiRequest } from "../utils/api";

export const TodoStore = types
  .model("TodoStore", {
    tasks: types.array(TaskModel),
    isLoading: false,
    error: types.maybeNull(types.string),
  })
  .views((self) => ({
    get completedTasks() {
      return self.tasks.filter((t) => t.done);
    },
    get pendingTasks() {
      return self.tasks.filter((t) => !t.done);
    },
  }))
  .actions((self) => ({
    setError: (error: any) => {
      self.error = error;
    },
  }))
  .actions((self) => ({
    load: flow(function* load() {
      self.isLoading = true;
      self.error = null;
      const tasks: Task[] = yield apiRequest<Task[]>(
        `/tasks`,
        {},
        {
          onFail: (e) => {
            self.setError(e.message);
          },
        },
      );
      self.tasks = cast(tasks ?? []);
      self.isLoading = false;
    }),
    addTask: flow(function* load(title: string) {
      const task: Task = yield apiRequest<Task>(
        `/tasks`,
        {
          method: "POST",
          body: {
            title,
          },
        },
        {
          onFail: (e) => {
            self.setError(e.message);
          },
        },
      );
      self.tasks.unshift(task);
    }),
  }));

type TodoStoreInstance = Instance<typeof TodoStore>;

let store: TodoStoreInstance;
export function useTodoStore(): TodoStoreInstance {
  if (!store) {
    store = TodoStore.create({
      tasks: [],
    });
  }
  return store;
}
