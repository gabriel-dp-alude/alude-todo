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
    setTasks: (tasks: TaskInstance[]) => {
      self.tasks = cast(tasks);
    },
    setError: (error: any) => {
      self.error = error;
    },
  }))
  .actions((self) => ({
    load: flow(function* load() {
      self.isLoading = true;
      self.error = null;
      yield apiRequest<TaskInstance[]>(
        `/tasks`,
        {},
        {
          onSuccess: self.setTasks,
        },
      );
      self.isLoading = false;
    }),

    addTask: flow(function* addTask(title: string) {
      self.isLoading = true;
      yield apiRequest<TaskInstance>(
        `/tasks`,
        {
          method: "POST",
          body: {
            title,
          },
        },
        {
          onSuccess: (data) => {
            self.setTasks([data, ...self.tasks]);
          },
        },
      );
      self.isLoading = false;
    }),

    removeTask: flow(function* removeTask(id_task: number) {
      self.isLoading = true;
      const task = self.tasks.find((t) => t.id_task === id_task);
      if (!task) return;
      yield apiRequest(
        `/tasks/${task.id_task}`,
        { method: "DELETE" },
        {
          onSuccess: (data) => {
            self.setTasks(self.tasks.filter((t) => t.id_task !== task.id_task));
          },
        },
      );
      self.isLoading = false;
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
