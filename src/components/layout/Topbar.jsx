import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { getInitials } from '../../lib/utils';
import { api } from '../../lib/axios';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDropdown } from './NotificationDropdown';

// ⬅️ onMenuClick prop add kiya (AppShell se aayega)
export function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isMountedRef = useRef(true);
  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { 
      isMountedRef.current = false;
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  // Cmd+K listener
  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    document.addEventListener('open-command-palette', handleOpenSearch);
    return () => document.removeEventListener('open-command-palette', handleOpenSearch);
  }, []);

  // Real unread count fetch (60 sec polling + tab hidden check)
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (document.hidden) return;

      try {
        const res = await api.get('/notifications');
        if (isMountedRef.current) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // Ignore silent errors
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleNotifToggle = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const handleNotifClose = () => {
    setIsNotifOpen(false);
    
    // Notification read hone ke baad count refresh
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/notifications');
        if (isMountedRef.current) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // Ignore
      }
    }, 800);
  };

  return (
    <>
      <header className="h-14 sm:h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 shrink-0">
        
        {/* Left: Mobile Menu & Search Trigger */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          
          {/* ⬇️ Mobile Menu Button (onClick add kiya) */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-1.5 -ml-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Desktop Search Bar */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 w-64 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-700 shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Search (Mobile), Notifications & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleNotifToggle}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />

              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {isNotifOpen && (
              <NotificationDropdown onClose={handleNotifClose} />
            )}
          </div>

          {/* Profile Avatar */}
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-pointer hover:ring-2 ring-indigo-300 transition-all shrink-0 overflow-hidden">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              getInitials(user?.name)
            )}
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}