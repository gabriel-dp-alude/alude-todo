import { ConfigProvider } from "antd";
import "antd/dist/reset.css";

export function AntDesignConfig(props: React.PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f57829",
        },
        components: {
          List: {
            emptyTextPadding: 0,
          },
        },
      }}>
      {props.children}
    </ConfigProvider>
  );
}
