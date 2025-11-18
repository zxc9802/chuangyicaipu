import Home from './pages/Home';
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
  }
];

export default routes;