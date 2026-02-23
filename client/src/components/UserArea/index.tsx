import { observer } from "mobx-react-lite";
import { Dropdown, Avatar, Space, Typography } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../models/AuthStore";

const { Text } = Typography;

export const UserArea = observer(() => {
  const authStore = useAuthStore();

  const items = [
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: authStore.logout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomLeft">
      <Space
        style={{
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: 6,
        }}>
        <Text strong style={{ whiteSpace: "nowrap" }}>
          {authStore.user?.username}
        </Text>
        <Avatar size="small" icon={<UserOutlined />} />
      </Space>
    </Dropdown>
  );
});

export default UserArea;
