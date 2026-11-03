import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  LayoutDashboard, CheckSquare, Users, Settings, 
  LogOut, Layers, ChevronDown, Moon, Sun, Shield, MessageSquare, Crown, X 
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useUIStore } from '../../store/useUIStore';
import { getInitials, cn } from '../../lib/utils';

// ⬅️ onClose prop add kiya hai taake mobile par click karne se band ho jaye
export function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspaceStore();
  const { theme, setTheme } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeWorkspace && workspaces.length > 0) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [activeWorkspace, workspaces, setActiveWorkspace]);

  const userRole = activeWorkspace?.members?.find(m => {
    const memberId = m.user?._id ? m.user._id.toString() : m.user?.toString();
    return memberId === user?._id?.toString();
  })?.role;
  
  const isAdmin = ['owner', 'admin'].includes(userRole);
  const isSuperAdmin = user?.role === 'super_admin';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/my-tasks', icon: CheckSquare },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Team', href: '/team', icon: Users },
    ...(isAdmin ? [{ name: 'Audit Logs', href: `/workspace/${activeWorkspace?._id}/audit`, icon: Shield }] : []),
    ...(isSuperAdmin ? [{ name: 'Admin Panel', href: '/admin', icon: Crown }] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose(); // Mobile menu band karo
    navigate('/login');
  };

  // Mobile par link click hone par menu band karne ke liye function
  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
      
      {/* Brand & Mobile Close Button */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xl tracking-tight">
          <Layers className="h-6 w-6 text-indigo-600 dark:text-indigo-500" />
          TaskForge
        </Link>
        
        {/* Mobile par X (Close) button */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Scrollable Area (Agar menu lamba ho toh scroll ho sake) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        
        {/* Workspace Switcher */}
        <div className="p-4 shrink-0">
          <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                {activeWorkspace ? getInitials(activeWorkspace.name) : '?'}
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[110px]">
                {activeWorkspace?.name || 'Select Workspace'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-4 py-2 flex-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleLinkClick} // Click par mobile menu close
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Dark Mode Toggle */}
        <div className="px-4 py-2 shrink-0">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 shrink-0" /> : <Sun className="h-5 w-5 shrink-0" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className={cn(
              "w-8 h-4 rounded-full relative transition-colors shrink-0",
              theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
            )}>
              <div className={cn(
                "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
                theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'
              )} />
            </div>
          </button>
        </div>

      </div>

      {/* User Profile (Fixed at bottom) */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 overflow-hidden">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Log out
        </button>
      </div>
    </div>
  );
}