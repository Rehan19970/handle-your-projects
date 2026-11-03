import { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';
import { api } from '../../../lib/axios';
import { formatTimeAgo } from '../../../lib/dateUtils';
import { getInitials } from '../../../lib/utils';
import { toast } from 'react-hot-toast';

export default function AdminActivities() {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/admin/activities?limit=100');
                setActivities(res.data || []);
            } catch (err) {
                toast.error('Failed to load activities');
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="px-1 sm:px-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    Platform Activity
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Real-time feed of all actions across the platform
                </p>
            </div>

            {/* Activity list */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-6 sm:p-10 text-center text-sm text-slate-500">Loading...</div>
                ) : activities.length === 0 ? (
                    <div className="p-6 sm:p-10 text-center text-sm text-slate-500">No activities yet</div>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activities.map((a) => (
                            <li
                                key={a._id}
                                className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                            >
                                {/* Avatar */}
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-[11px] sm:text-sm shrink-0 overflow-hidden">
                                    {a.actor?.avatar?.url ? (
                                        <img
                                            src={a.actor.avatar.url}
                                            alt=""
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        getInitials(a.actor?.name)
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                                        <strong className="text-slate-900 dark:text-white">
                                            {a.actor?.name}
                                        </strong>{' '}
                                        {a.action?.replace(/\./g, ' ')}
                                        {a.task?.title && (
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400 break-words">
                                                {' '}
                                                "{a.task.title}"
                                            </span>
                                        )}
                                    </p>

                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] sm:text-xs text-slate-500">
                                        {a.workspace?.name && (
                                            <span className="flex items-center gap-1 max-w-full truncate">
                                                <span aria-hidden>📁</span>
                                                <span className="truncate">{a.workspace.name}</span>
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 shrink-0">
                                            <Clock className="h-3 w-3" />
                                            {formatTimeAgo(a.createdAt)}
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