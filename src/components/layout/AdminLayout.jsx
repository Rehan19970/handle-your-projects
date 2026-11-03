import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, ArrowLeft, 
  Shield, LogOut, Layers, Activity
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { getInitials, cn } from '../../lib/utils';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Workspaces', href: '/admin/workspaces', icon: Building2 },
    { name: 'Activities', href: '/admin/activities', icon: Activity },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <div className="flex h-screen w-64 flex-col bg-slate-950 text-white border-r border-slate-800">
        {/* Brand */}
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Shield className="h-6 w-6 text-red-500" />
            <span className="text-white">TaskForge</span>
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-md ml-1">
              ADMIN
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-red-500/10 text-red-400" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-red-400" : "text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Back to app */}
        <div className="px-4 py-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to App
          </Link>
        </div>

        {/* User Profile */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-red-400 truncate">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}