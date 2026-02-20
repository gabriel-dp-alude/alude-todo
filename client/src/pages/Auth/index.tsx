import { useRef } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";

import { useAuthStore } from "../../models/AuthStore";

export const Auth = observer(() => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  async function attemptLogin() {
    if (!usernameInputRef.current || !passwordInputRef.current) return;
    const username = usernameInputRef.current.value;
    const password = passwordInputRef.current.value;
    const result = await authStore.login(username, password);
    if (result) navigate("/");
  }

  return (
    <form>
      {!authStore.user ? (
        <>
          <div>
            <input type="text" ref={usernameInputRef} />
            <input type="password" ref={passwordInputRef} />
            <button type="button" onClick={attemptLogin}>
              login
            </button>
          </div>
          <p>{authStore.error}</p>
        </>
      ) : (
        <>
          <button onClick={authStore.logout}>logout</button>
        </>
      )}
    </form>
  );
});
