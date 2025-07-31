import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, ConfigProvider, Switch } from "antd";
import { Link } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const Homelayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = (checked) => {
    setIsDark(checked);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        {/* Header */}
        <Header
          style={{
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            // Blue gradient background in light mode, dark in dark mode
            background: isDark
              ? "#001529"
              : "linear-gradient(to right, #0a198b, #1e3a8a)",
            color: "#facc15", // yellow text
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          <div>
            <span style={{ marginRight: 8 }}>Dark Mode</span>
            <Switch checked={isDark} onChange={toggleTheme} />
          </div>
        </Header>

        {/* Content Area */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: isDark ? "#141414" : "#f3f4f6", // dark gray / light gray
            borderRadius: "8px",
          }}
        >
          {children}
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default Homelayout;
