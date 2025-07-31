import React, { useState, useEffect } from 'react';
import {
  BranchesOutlined,
  DashboardOutlined,
  DollarCircleFilled,
  GiftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BulbOutlined,
  BulbFilled,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  Button,
  Breadcrumb,
  Avatar,
  Switch,
  Dropdown,
  Drawer,
  theme as antdTheme,
} from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../Theme/ThemeContext';
import logo from '../../../src/assets/main.logo.png';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const { Header, Sider, Content, Footer } = Layout;

const Adminlayout = ({ children }) => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { borderRadiusLG },
  } = antdTheme.useToken();

  const { darkMode, setDarkMode } = useTheme();

  const navigate = useNavigate();

  // User info from sessionStorage
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

  // Menu items
  const items = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/branding',
      icon: <GiftOutlined />,
      label: <Link to="/admin/branding">Branding</Link>,
    },
    {
      key: '/admin/branch',
      icon: <BranchesOutlined />,
      label: <Link to="/admin/branch">Branch</Link>,
    },
    {
      key: '/admin/currency',
      icon: <DollarCircleFilled />,
      label: <Link to="/admin/currency">Currency</Link>,
    },
    {
      key: '/admin/new-employee',
      icon: <UserOutlined />,
      label: <Link to="/admin/new-employee">New Employee</Link>,
    },
    {
      key: '/admin/new-account',
      icon: <UserAddOutlined />,
      label: <Link to="/admin/new-account">New Account</Link>,
    },
    {
      key: '/admin/new-transaction',
      icon: <UserAddOutlined />,
      label: <Link to="/admin/new-transaction">New Transaction</Link>,
    },
    {
      key: '/admin/logout',
      icon: <LoginOutlined />,
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

  // Theme colors
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

  // Breadcrumb mapping
  const breadcrumbNameMap = {
    '/admin': 'Dashboard',
    '/admin/branding': 'Branding',
    '/admin/branch': 'Branch',
    '/admin/currency': 'Currency',
    '/admin/new-employee': 'New Employee',
    '/admin/new-account': 'New Account',
    '/admin/new-transaction': 'New Transaction',
  };

  // Generate breadcrumbs dynamically
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

  // Dropdown for profile
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

  // Responsive handling
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  return (
    <Layout
      hasSider
      style={{
        minHeight: '100vh',
        background: theme.bg,
        overflow: 'hidden',
      }}
    >
      {/* Sidebar for Desktop */}
      {!isMobile && (
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
      )}

      {/* Drawer for Mobile */}
      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={toggleDrawer}
          open={drawerVisible}
          bodyStyle={{ padding: 0, background: theme.siderBg }}
        >
          <div
            style={{
              height: 80,
              margin: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
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
            items={items}
            style={{
              borderRight: 0,
              background: 'transparent',
              color: theme.text,
            }}
          />
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* Header */}
        <Header
          style={{
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : collapsed ? 80 : 200,
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
              icon={isMobile ? <MenuUnfoldOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={isMobile ? toggleDrawer : () => setCollapsed(!collapsed)}
              style={{ fontSize: '20px', color: '#fff', marginRight: 16 }}
            />
            <h1 style={{ color: '#facc15', margin: 0, fontSize: 20 }}>Admin Panel</h1>
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
                {user?.fullname?.charAt(0).toUpperCase() || 'A'}
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

export default Adminlayout;
