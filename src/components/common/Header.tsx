import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { History, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('已退出登录');
      navigate('/login');
    } catch (error: any) {
      console.error('退出登录失败:', error);
      toast.error('退出登录失败');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-end px-4">
        {/* 导航和用户信息 */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/history">
                <Button variant="ghost" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  历史记录
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{profile?.username}</span>
              </div>

              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  注册
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
