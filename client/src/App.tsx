import { useEffect } from "react";
import { observer } from "mobx-react-lite";

import { Router } from "./router";
import { AntDesignConfig } from "./config/AntDesignConfig";
import { useAuthStore } from "./models/AuthStore";

export const App = observer(() => {
  const authStore = useAuthStore();

  useEffect(() => {
    authStore.initialize();
  }, [authStore]);

  return <AntDesignConfig>{authStore.isInitializing ? <></> : <Router />}</AntDesignConfig>;
});
