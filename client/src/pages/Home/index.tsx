import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";

import { useTodoStore } from "../../models/TodoStore";
import { useAuthStore } from "../../models/AuthStore";
import { TaskCard } from "../../components/TaskCard";

export const Home = observer(() => {
  const todoStore = useTodoStore();
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authStore.isAuthenticated) {
      navigate("/auth");
      return;
    }
    todoStore.load();
  }, [authStore.isAuthenticated, todoStore, navigate]);

  async function handleAddButton() {
    if (!titleInputRef.current) return;
    const title = titleInputRef.current.value;
    await todoStore.addTask(title);
    titleInputRef.current.value = "";
  }

  return (
    <div>
      <div>
        <p>
          user: {authStore.user?.username} ({authStore.user?.id_user})
        </p>
        <button onClick={authStore.logout}>logout</button>
        <p>state: {todoStore.isLoading ? "Loading..." : "Ok"}</p>
        <p>error: {todoStore.error || "-"}</p>
      </div>
      <form>
        <input type="text" ref={titleInputRef} />
        <button type="button" onClick={handleAddButton}>
          Add Task
        </button>
      </form>
      {todoStore.tasks.map((t) => (
        <TaskCard key={t.id_task} task={t} />
      ))}
    </div>
  );
});
