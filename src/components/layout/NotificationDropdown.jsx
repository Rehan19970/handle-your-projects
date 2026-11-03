import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, MessageSquare, UserPlus, Check, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../lib/dateUtils';
import { api } from '../../lib/axios';
import { toast } from 'react-hot-toast';

export function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (isMountedRef.current) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        if (isMountedRef.current) {
          toast.error('Failed to load notifications');
        }
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const markRead = async (id) => {
    if (pendingId) return;
    setPendingId(id);

    // Optimistic Update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      toast.error('Failed to mark as read');
      // Optional: Rollback state here if needed
    } finally {
      if (isMountedRef.current) setPendingId(null);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned': return <CheckCircle2 className="h-4 w-4 text-indigo-500" />;
      case 'comment_added': return <MessageSquare className="h-4 w-4 text-emerald-500" />;
      case 'update_added': return <Info className="h-4 w-4 text-amber-500" />;
      case 'workspace_invite': return <UserPlus className="h-4 w-4 text-amber-500" />;
      default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Dropdown Container */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        // ⬇️ Width mobile par calc(100vw - 2rem) aur desktop par w-80
        className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-[400px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 origin-top-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
            Notifications {unreadCount > 0 && <span className="text-indigo-600">({unreadCount})</span>}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <ul className="max-h-[50vh] sm:max-h-96 overflow-y-auto">
          {isLoading ? (
            <li className="p-6 text-center text-xs sm:text-sm text-slate-500">Loading...</li>
          ) : notifications.length === 0 ? (
            <li className="p-6 text-center text-xs sm:text-sm text-slate-500">No new notifications</li>
          ) : (
            notifications.map(notif => {
              const targetLink = notif.task?._id && notif.project?._id
                ? `/workspace/${notif.workspace?._id}/project/${notif.project?._id}/board`
                : '/dashboard';

              return (
                <li key={notif._id}>
                  <Link
                    to={targetLink}
                    onClick={() => {
                      if (!notif.isRead) markRead(notif._id);
                      onClose();
                    }}
                    className={`p-3 sm:p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-2.5 sm:gap-3 ${!notif.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                  >
                    <div className="mt-0.5 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>

        {/* Footer */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="text-[10px] sm:text-xs text-slate-500 hover:text-indigo-600 w-full py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}