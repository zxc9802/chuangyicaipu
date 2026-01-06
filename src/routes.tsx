import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '创意食谱',
    path: '/',
    element: <Home />
  },
  {
    name: '登录',
    path: '/login',
    element: <Login />,
    visible: false
  },
  {
    name: '注册',
    path: '/register',
    element: <Register />,
    visible: false
  },
  {
    name: '历史记录',
    path: '/history',
    element: <History />
  }
];

export default routes;