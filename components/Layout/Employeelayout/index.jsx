import React, { useState, useEffect } from 'react';
import {
  BranchesOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BulbOutlined,
  BulbFilled,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  Button,
  Breadcrumb,
  Avatar,
  Dropdown,
  Switch,
  theme as antdTheme,
} from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../Theme/ThemeContext';
import logo from '../../../src/assets/main.logo.png';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const { Header, Sider, Content, Footer } = Layout;

const Employeelayout = ({ children }) => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { borderRadiusLG },
  } = antdTheme.useToken();

  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('userInfo');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Logout function
  const logoutFunc = () => {
    sessionStorage.removeItem('userInfo');
    cookies.remove('authToken');
    navigate('/');
  };

  const items = [
    {
      key: '/employee',
      icon: <DashboardOutlined />,
      label: <Link to="/employee">Dashboard</Link>,
    },
    {
      key: '/employee/new-account',
      icon: <UserAddOutlined />,
      label: <Link to="/employee/new-account">New Account</Link>,
    },
    {
      key: '/employee/new-transaction',
      icon: <BranchesOutlined />,
      label: <Link to="/employee/new-transaction">New Transaction</Link>,
    },
    {
      key: '/employee/logout',
      icon: <LogoutOutlined />,
      label: (
        <Button
          type="text"
          className="!text-gray-300 !font-semibold"
          onClick={logoutFunc}
        >
          Logout
        </Button>
      ),
    },
  ];

  // Theme
  const themeColors = {
    dark: {
      bg: '#000',
      text: '#fff',
      cardBg: '#141414',
      siderBg: '#141414',
    },
    light: {
      bg: '#e6f0fa',
      text: '#facc15',
      cardBg: '#fff',
      siderBg: 'linear-gradient(to bottom, #0a198b, #1e3a8a)',
    },
  };

  const theme = darkMode ? themeColors.dark : themeColors.light;

  // Breadcrumb mapping for employee routes
  const breadcrumbNameMap = {
    '/employee': 'Dashboard',
    '/employee/new-account': 'New Account',
    '/employee/new-transaction': 'New Transaction',
  };

  const pathSnippets = pathname.split('/').filter((i) => i);
  const breadcrumbItems = [
    { title: 'Home', path: '/' },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return {
        title: breadcrumbNameMap[url] || url,
        path: url,
      };
    }),
  ];

  const profileMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: (
            <div>
              <strong>{user?.fullname}</strong>
              <br />
              <small>{user?.email}</small>
            </div>
          ),
        },
        {
          key: '2',
          label: <Button type="text" onClick={logoutFunc}>Logout</Button>,
        },
      ]}
    />
  );

  return (
    <Layout
      hasSider
      style={{
        minHeight: '100vh',
        background: theme.bg,
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: theme.siderBg,
          paddingTop: 20,
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          className="logo"
          style={{
            height: 80,
            margin: '0 16px 24px',
            background: 'transparent',
            borderRadius: 12,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
            boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
          }}
        >
          <img
            src={logo}
            alt="SOB Logo"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: 4,
              border: '2px solid #fff',
            }}
          />
          S.O. Bank
        </div>
        <Menu
          theme={darkMode ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[pathname]}
          defaultSelectedKeys={[pathname]}
          items={items}
          style={{
            borderRight: 0,
            background: 'transparent',
            color: theme.text,
          }}
        />
      </Sider>

      {/* Layout Content */}
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            position: 'fixed',
            top: 0,
            left: collapsed ? 80 : 200,
            right: 0,
            zIndex: 1000,
            background: theme.siderBg,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
            transition: 'left 0.2s',
            color: theme.text,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '20px', color: '#fff', marginRight: 16 }}
            />
            <h1 style={{ color: '#facc15', margin: 0, fontSize: 20 }}>Employee Panel</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Switch
              checked={darkMode}
              onChange={setDarkMode}
              checkedChildren={<BulbFilled />}
              unCheckedChildren={<BulbOutlined />}
            />
            <Dropdown overlay={profileMenu} placement="bottomRight">
              <Avatar
                style={{
                  backgroundColor: '#0075c9',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {user?.fullname?.charAt(0).toUpperCase() || 'E'}
              </Avatar>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{ marginTop: 64, padding: '24px 24px 0' }}>
          <Breadcrumb
            style={{ marginBottom: 16, color: theme.text }}
            items={breadcrumbItems.map((item) => ({
              title: <Link to={item.path}>{item.title}</Link>,
            }))}
          />
          <div
            style={{
              padding: 24,
              minHeight: 380,
              background: theme.cardBg,
              borderRadius: borderRadiusLG,
              color: darkMode ? '#fff' : '#000',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            }}
          >
            {children}
          </div>
        </Content>

        {/* Footer */}
        <Footer
          style={{
            textAlign: 'center',
            background: theme.cardBg,
            color: darkMode ? '#fff' : '#000',
            marginTop: 24,
          }}
        >
          Stack Overflow Bank ©{new Date().getFullYear()} — Empowering Devs
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Employeelayout;
