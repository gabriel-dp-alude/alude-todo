import { cast, flow, Instance, types } from "mobx-state-tree";

import { TaskInstance, TaskModel } from "./Task";
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
      const tasks: TaskInstance[] = yield apiRequest<TaskInstance[]>(
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
    addTask: flow(function* addTask(title: string) {
      const task: TaskInstance = yield apiRequest<TaskInstance>(
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
    removeTask: flow(function* removeTask(id_task: number) {
      const task = self.tasks.find((t) => t.id_task === id_task);
      if (!task) return;
      yield apiRequest(`/tasks/${task.id_task}`, { method: "DELETE" });
      self.tasks = cast(self.tasks.filter((t) => t.id_task !== task.id_task));
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
