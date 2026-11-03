import { useState, useEffect } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { getInitials } from '../../lib/utils';
import { api } from '../../lib/axios';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDropdown } from './NotificationDropdown';

export function Topbar() {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cmd+K listener
  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    document.addEventListener('open-command-palette', handleOpenSearch);
    return () => document.removeEventListener('open-command-palette', handleOpenSearch);
  }, []);

  // Real unread count fetch (60 sec polling + tab hidden check)
  useEffect(() => {
    let isMounted = true;

    const fetchUnreadCount = async () => {
      // Agar tab hidden hai, toh fetch mat karo (rate limit bachao)
      if (document.hidden) return;

      try {
        const res = await api.get('/notifications');
        if (isMounted) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // 429 ya network error silently ignore
      }
    };

    // Pehli baar fetch karo
    fetchUnreadCount();

    // Har 60 sec baad fetch karo
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleNotifToggle = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const handleNotifClose = () => {
    setIsNotifOpen(false);
    // Notification read hone ke baad count refresh
    setTimeout(async () => {
      try {
        const res = await api.get('/notifications');
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        // Ignore
      }
    }, 800);
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
        {/* Left: Mobile Menu & Search Trigger */}
        <div className="flex items-center gap-4 flex-1">
          <button className="md:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <Menu className="h-6 w-6" />
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 w-64 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-700">⌘K</kbd>
          </button>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={handleNotifToggle}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors relative"
            >
              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {isNotifOpen && (
              <NotificationDropdown onClose={handleNotifClose} />
            )}
          </div>

          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:ring-2 ring-indigo-300 transition-all">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
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