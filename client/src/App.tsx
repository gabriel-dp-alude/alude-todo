import { useEffect } from "react";

import { Router } from "./router";
import { useAuthStore } from "./models/AuthStore";
import { observer } from "mobx-react-lite";

export const App = observer(() => {
  const authStore = useAuthStore();

  useEffect(() => {
    authStore.initialize();
  }, [authStore]);

  if (!authStore.isInitializing) return <Router />;
  else return <></>;
});
