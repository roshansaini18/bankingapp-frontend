import React, { useState, useEffect } from 'react';
import {
  UserOutlined,
  DashboardOutlined,
  AccountBookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BulbOutlined,
  BulbFilled,
  UsergroupAddOutlined,
  BankOutlined ,
  CreditCardOutlined
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  Button,
  Breadcrumb,
  Avatar,
  Dropdown,
  Switch,
  Drawer,
  theme as antdTheme,
} from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../Theme/ThemeContext';
import logo from '../../../src/assets/main.logo.png';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const { Header, Sider, Content, Footer } = Layout;

const Customerlayout = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 768); // detect mobile
  const [drawerVisible, setDrawerVisible] = useState(false);

  const {
    token: { borderRadiusLG },
  } = antdTheme.useToken();

  const { darkMode, setDarkMode } = useTheme();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('userInfo');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logoutFunc = () => {
    sessionStorage.removeItem('userInfo');
    cookies.remove('authToken');
    navigate('/');
  };

  const items = [
    {
      key: '/customer',
      icon: <DashboardOutlined />,
      label: <Link to="/customer">Dashboard</Link>,
    },
    {
      key: '/customer/transaction',
      icon: <AccountBookOutlined />,
      label: <Link to="/customer/transaction">Transactions</Link>,
    },
     {
      key: '/customer/payees',
      icon: <UsergroupAddOutlined  />,
      label: <Link to="/customer/payees">Payees</Link>,
    },
    {
      key: '/customer/transfer',
      icon: <BankOutlined   />,
      label: <Link to="/customer/transfer">Fund Transfer</Link>,
    },
     {
      key: '/customer/card',
      icon: <CreditCardOutlined    />,
      label: <Link to="/customer/card">Manage Card</Link>,
    },
    {
      key: '/customer/profile',
      icon: <UserOutlined />,
      label: <Link to="/customer/profile">Profile</Link>,
    },
    {
      key: '/customer/logout',
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

  const breadcrumbNameMap = {
    '/customer': 'Dashboard',
    '/customer/transaction': 'Transactions',
    '/customer/profile': 'Profile',
    '/customer/payees': 'Payees',
    '/customer/transfer': 'Fund Transfer',
    '/customer/card': 'Card',
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
              <strong>{user?.fullName}</strong>
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

  // Sidebar Content reusable for Drawer + Desktop Sider
  const SidebarContent = (
    <div style={{ paddingTop: 20 }}>
      <div
        className="logo"
        style={{
          height: 80,
          margin: '0 16px 24px',
          background: 'transparent',
          textAlign: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        <img
          src={logo}
          alt="SOB Logo"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
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
        onClick={() => mobile && setDrawerVisible(false)} // close drawer on click
        style={{
          borderRight: 0,
          background: 'transparent',
          color: theme.text,
        }}
      />
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: theme.bg }}>
      {/* Mobile Drawer */}
      {mobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0, background: theme.siderBg }}
        >
          {SidebarContent}
        </Drawer>
      )}

      {/* Desktop Sidebar */}
      {!mobile && (
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
          {SidebarContent}
        </Sider>
      )}

      <Layout style={{ marginLeft: !mobile ? (collapsed ? 80 : 200) : 0, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            position: 'fixed',
            top: 0,
            left: !mobile ? (collapsed ? 80 : 200) : 0,
            right: 0,
            zIndex: 1000,
            background: theme.siderBg,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            justifyContent: 'space-between',
            transition: 'left 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={
                mobile
                  ? drawerVisible
                    ? <MenuFoldOutlined />
                    : <MenuUnfoldOutlined />
                  : collapsed
                    ? <MenuUnfoldOutlined />
                    : <MenuFoldOutlined />
              }
              onClick={() =>
                mobile ? setDrawerVisible(!drawerVisible) : setCollapsed(!collapsed)
              }
              style={{ fontSize: '20px', color: '#fff', marginRight: 16 }}
            />
            <h1 style={{ color: '#facc15', margin: 0, fontSize: 20 }}>Customer</h1>
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
                {user?.fullName?.charAt(0).toUpperCase() || 'C'}
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

export default Customerlayout;
