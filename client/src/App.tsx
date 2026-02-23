import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";

import { Router } from "./router";
import { useAuthStore } from "./models/AuthStore";

export const App = observer(() => {
  const authStore = useAuthStore();

  useEffect(() => {
    authStore.initialize();
  }, [authStore]);

  return (
    <ConfigProvider
      theme={{
        components: {
          List: {
            emptyTextPadding: 0,
          },
        },
      }}>
      {authStore.isInitializing ? <></> : <Router />}
    </ConfigProvider>
  );
});
