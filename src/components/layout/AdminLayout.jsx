import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, ArrowLeft, 
  Shield, LogOut, Activity, Menu, X
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { getInitials, cn } from '../../lib/utils';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ⬅️ Mobile menu state

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

  const closeSidebar = () => setIsSidebarOpen(false);

  // Sidebar ka poora UI ek variable mein nikal diya taake mobile/desktop dono jagah use ho sake
  const SidebarContent = () => (
    <div className="flex h-full w-64 flex-col bg-slate-950 text-white border-r border-slate-800">
      {/* Brand */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Shield className="h-6 w-6 text-red-500 shrink-0" />
          <span className="text-white">TaskForge</span>
          <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-md ml-1">
            ADMIN
          </span>
        </div>
        
        {/* Mobile Close Button */}
        <button onClick={closeSidebar} className="lg:hidden p-1 text-slate-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={closeSidebar} // Click par mobile menu band
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-red-500/10 text-red-400" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-red-400" : "text-slate-500")} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to app */}
      <div className="px-4 py-2 shrink-0">
        <Link
          to="/dashboard"
          onClick={closeSidebar}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          <span className="truncate">Back to App</span>
        </Link>
      </div>

      {/* User Profile */}
      <div className="border-t border-slate-800 p-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
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
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* 1. Desktop Sidebar (Fixed) */}
      <div className="hidden lg:block shrink-0 h-full">
        <SidebarContent />
      </div>

      {/* 2. Mobile Sidebar (Drawer) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" 
            onClick={closeSidebar} 
          />
          {/* Drawer Panel */}
          <div className="relative w-64 max-w-[80%] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Mobile Top Header (Sirf mobile par) */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-bold text-white">Admin Panel</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}