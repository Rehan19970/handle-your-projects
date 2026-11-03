import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Clock, User, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { formatTimeAgo } from '../../../lib/dateUtils';
import { getInitials } from '../../../lib/utils';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

export default function AuditLog() {
  const { workspaceId } = useParams();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      if (!workspaceId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (isMounted) setIsLoading(true);

      try {
        const res = await api.get(`/workspaces/${workspaceId}/activity`);
        if (isMounted) setActivities(res.data || []);
      } catch (error) {
        if (isMounted) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              'Failed to load audit logs'
          );
          setActivities([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchLogs();

    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  const formatAction = (action) => {
    const actions = {
      'task.created': 'created a task',
      'task.updated': 'updated a task',
      'task.moved': 'moved a task',
      'task.assigned': 'assigned a task',
      'task.deleted': 'deleted a task',
      'task.completed': 'completed a task',
      'comment.created': 'added a comment',
      'project.created': 'created a project',
      'attachment.added': 'uploaded a file',
      'member.joined': 'joined the workspace',
      'member.invited': 'invited a member',
      'member.removed': 'removed a member',
    };
    return actions[action] || action?.replace(/\./g, ' ') || 'performed an action';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 px-1 sm:px-0">
        <Skeleton className="h-7 sm:h-8 w-40 sm:w-48 mb-4 sm:mb-6" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 sm:h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
          <Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-indigo-500 shrink-0" />
          Audit Log
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          A complete history of all actions in this workspace.
        </p>
      </div>

      {/* Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Actions performed in this workspace will appear here."
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.map((activity) => (
              <li
                key={activity._id}
                className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                {/* Avatar */}
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {activity.actor?.avatar?.url ? (
                    <img
                      src={activity.actor.avatar.url}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                      {getInitials(activity.actor?.name)}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {activity.actor?.name || 'Unknown User'}
                    </span>{' '}
                    {formatAction(activity.action)}
                    {activity.task?.title && (
                      <span className="font-medium text-indigo-600 dark:text-indigo-400 break-words">
                        {' '}
                        "{activity.task.title}"
                      </span>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-1 text-[10px] sm:text-xs text-slate-500">
                    <span className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <Clock className="h-3 w-3 shrink-0" />
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                      <Activity className="h-3 w-3 shrink-0" />
                      <span className="truncate">{activity.action}</span>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}