import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "../../models/Store";
import { TaskCard } from "../../components/TaskCard";
import { apiRequest } from "../../util/api";

export const Home = observer(() => {
  const store = useStore();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // TODO: Temporary auth while login is not finished
    async function loginAndLoad() {
      await apiRequest(`/auth/login`, {
        method: "POST",
        body: JSON.stringify({
          username: "rafael",
          password: "12345678",
        }),
      });
      store.load();
    }
    loginAndLoad();
  }, [store]);

  async function handleAddButton() {
    if (!titleInputRef.current) return;
    const title = titleInputRef.current.value;
    await store.addTask(title);
    titleInputRef.current.value = "";
  }

  return (
    <div>
      {store.isLoading && "Loading..."}
      {store.error}
      <form>
        <input type="text" ref={titleInputRef} />
        <button type="button" onClick={handleAddButton}>
          Add
        </button>
      </form>
      {store.tasks.map((t) => (
        <TaskCard key={t.id_task} task={t} />
      ))}
    </div>
  );
});
