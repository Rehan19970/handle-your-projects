import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, MessageSquare, UserPlus, Check, Info } from 'lucide-react';
import { Link } from 'react-router-dom'; // ⬅️ NAYA
import { formatTimeAgo } from '../../lib/dateUtils';
import { api } from '../../lib/axios';
import { toast } from 'react-hot-toast';

export function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all/read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      console.error(err);
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
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            Notifications {unreadCount > 0 && <span className="text-indigo-600">({unreadCount})</span>}
          </h3>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1">
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>

        <ul className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <li className="p-6 text-center text-sm text-slate-500">Loading...</li>
          ) : notifications.length === 0 ? (
            <li className="p-6 text-center text-sm text-slate-500">No new notifications</li>
          ) : (
            notifications.map(notif => {
              // Determine where to send the user
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
                    className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 ${!notif.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                  >
                    <div className="mt-0.5 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>

        <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <button onClick={onClose} className="text-xs text-slate-500 hover:text-indigo-600 w-full py-1">
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}