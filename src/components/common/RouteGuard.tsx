import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// 公开路由（不需要登录）
const PUBLIC_ROUTES = ['/login', '/register'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

      if (!user && !isPublicRoute) {
        // 未登录且访问受保护路由，重定向到登录页
        navigate('/login', { state: { from: location.pathname } });
      } else if (user && (location.pathname === '/login' || location.pathname === '/register')) {
        // 已登录且访问登录/注册页，重定向到首页
        navigate('/');
      }
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
