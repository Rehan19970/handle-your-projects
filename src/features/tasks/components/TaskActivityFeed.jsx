import { useEffect, useState } from 'react';
import { Activity, User } from 'lucide-react';
import { api } from '../../../lib/axios';
import { formatTimeAgo } from '../../../lib/dateUtils';

export function TaskActivityFeed({ taskId, workspaceId }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchActivity = async () => {
      if (!workspaceId || !taskId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (isMounted) setIsLoading(true);

      try {
        const res = await api.get(
          `/workspaces/${workspaceId}/activity/tasks/${taskId}`
        );
        if (isMounted) setActivities(res.data || []);
      } catch (error) {
        console.error('Failed to load activity', error);
        if (isMounted) setActivities([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchActivity();

    return () => {
      isMounted = false;
    };
  }, [taskId, workspaceId]);

  if (isLoading) {
    return (
      <div className="text-xs sm:text-sm text-slate-500 p-3 sm:p-4">
        Loading activity...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-xs sm:text-sm text-slate-500 p-3 sm:p-4">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <ul className="space-y-2.5 sm:space-y-3">
        {activities.map((act) => {
          const actionText = (act.action || '')
            .replace(/\./g, ' ')
            .replace(/_/g, ' ');
          return (
            <li key={act._id} className="flex items-start gap-2.5 sm:gap-3">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                {act.actor?.avatar?.url ? (
                  <img
                    src={act.actor.avatar.url}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {act.actor?.name || 'Someone'}
                  </span>{' '}
                  {actionText}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                  {formatTimeAgo(act.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}