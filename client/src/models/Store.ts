import { cast, flow, Instance, types } from "mobx-state-tree";

import { Task, TaskModel } from "./Task";
import { apiRequest } from "../util/api";

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
    setIsLoading: (isLoading: boolean) => {
      self.isLoading = isLoading;
    },
    setError: (error: any) => {
      self.error = error;
    },
  }))
  .actions((self) => {
    const load = flow(function* load() {
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
    });
    const addTask = flow(function* load(title: string) {
      const task: Task = yield apiRequest<Task>(
        `/tasks`,
        {
          method: "POST",
          body: JSON.stringify({
            title,
          }),
        },
        {
          onFail: (e) => {
            self.setError(e.message);
          },
        },
      );
      self.tasks.push(task);
    });
    return { load, addTask };
  });

type TodoStoreInstance = Instance<typeof TodoStore>;

let todoStore: TodoStoreInstance;
export function useStore(): TodoStoreInstance {
  if (!todoStore) {
    todoStore = TodoStore.create({
      tasks: [
        {
          id_task: 0,
          title: "Example",
          done: false,
          created_at: new Date().toISOString(),
        },
      ],
    });
  }
  return todoStore;
}
