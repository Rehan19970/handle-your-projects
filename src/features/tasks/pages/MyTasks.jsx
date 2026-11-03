import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Circle, Clock, AlertCircle, Search, ChevronDown, Sparkles,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { formatDueDate, getDueDateColor } from '../../../lib/dateUtils';
import { cn } from '../../../lib/utils';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useAuth } from '../../../app/providers/AuthProvider';

export default function MyTasks() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspaceStore();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [pendingId, setPendingId] = useState(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const fetchMyTasks = async () => {
      if (!activeWorkspace?._id || !user?._id) {
        if (isMountedRef.current) setIsLoading(false);
        return;
      }

      if (isMountedRef.current) setIsLoading(true);

      try {
        // 1 request for projects
        const projRes = await api.get(`/workspaces/${activeWorkspace._id}/projects`);
        if (!isMountedRef.current) return;

        const projects = projRes.data || [];

        // Parallel fetch for all project tasks — N+1 fix
        const tasksPerProject = await Promise.all(
          projects.map((proj) =>
            api
              .get(`/workspaces/${activeWorkspace._id}/projects/${proj._id}/tasks`)
              .then((r) => ({ proj, tasks: r.data || [] }))
              .catch(() => ({ proj, tasks: [] }))
          )
        );
        if (!isMountedRef.current) return;

        let allTasks = [];
        for (const { proj, tasks: projTasks } of tasksPerProject) {
          const myTasks = projTasks.filter((t) =>
            t.assignees?.some((a) => (a._id || a) === user._id)
          );
          allTasks = [
            ...allTasks,
            ...myTasks.map((t) => ({
              ...t,
              projectName: proj.name,
              projectId: proj._id,
            })),
          ];
        }

        allTasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });

        if (isMountedRef.current) setTasks(allTasks);
      } catch (error) {
        if (isMountedRef.current) {
          toast.error(
            error?.response?.data?.message || error?.message || 'Failed to load tasks'
          );
        }
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };
    fetchMyTasks();
  }, [activeWorkspace?._id, user?._id]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'todo'
          ? task.status !== 'done'
          : filter === 'done'
          ? task.status === 'done'
          : true;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const toggleTaskStatus = async (task) => {
    if (pendingId) return;
    setPendingId(task._id);

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const previousTasks = tasks;

    // Optimistic update
    setTasks(
      tasks.map((t) =>
        t._id === task._id ? { ...t, status: newStatus, columnId: newStatus } : t
      )
    );

    try {
      await api.patch(
        `/workspaces/${activeWorkspace._id}/projects/${task.projectId}/tasks/${task._id}`,
        { columnId: newStatus }
      );
    } catch (error) {
      toast.error('Failed to update task');
      if (isMountedRef.current) setTasks(previousTasks);
    } finally {
      if (isMountedRef.current) setPendingId(null);
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="p-6 sm:p-10 text-center text-xs sm:text-sm text-slate-500">
        Select a workspace to view tasks.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate">
            All your assigned tasks across{' '}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {activeWorkspace.name}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search tasks..."
              className="pl-9 h-9 sm:h-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="relative w-full sm:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm rounded-lg pl-3 sm:pl-4 pr-9 sm:pr-10 h-9 sm:h-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Tasks</option>
              <option value="todo">Active (Pending)</option>
              <option value="done">Completed</option>
            </select>
            <ChevronDown className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className="h-4 sm:h-5 w-2/3 sm:w-1/3" />
                  <Skeleton className="h-3 sm:h-4 w-1/3 sm:w-1/4" />
                </div>
                <Skeleton className="h-5 sm:h-6 w-12 sm:w-16 rounded-md shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No tasks found"
            description={
              search || filter !== 'all'
                ? "Try adjusting your search or filters to find what you're looking for."
                : 'You have no assigned tasks. Enjoy your day!'
            }
            actionLabel="Back to Dashboard"
            actionLink="/dashboard"
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTasks.map((task) => (
              <li
                key={task._id}
                className="group p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-start gap-2.5 sm:gap-4"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTaskStatus(task)}
                  disabled={pendingId !== null}
                  className="shrink-0 mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors focus:outline-none disabled:opacity-50 p-0.5 rounded-md"
                  aria-label={
                    task.status === 'done'
                      ? 'Mark as pending'
                      : 'Mark as complete'
                  }
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/workspace/${activeWorkspace._id}/project/${task.projectId}/board`}
                    className="hover:underline decoration-indigo-500 block"
                  >
                    <p
                      className={cn(
                        'text-xs sm:text-base font-medium truncate',
                        task.status === 'done'
                          ? 'text-slate-400 line-through'
                          : 'text-slate-900 dark:text-white'
                      )}
                    >
                      {task.title}
                    </p>
                  </Link>

                  <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-[10px] sm:text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium max-w-full truncate">
                      {task.projectName}
                    </span>
                    {task.dueDate && (
                      <span
                        className={cn(
                          'flex items-center gap-1 sm:gap-1.5 font-medium',
                          getDueDateColor(task.dueDate, task.status)
                        )}
                      >
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        {formatDueDate(task.dueDate)}
                      </span>
                    )}
                    <span
                      className={cn(
                        'flex items-center gap-1 sm:gap-1.5 font-medium capitalize',
                        task.priority === 'urgent'
                          ? 'text-red-600'
                          : task.priority === 'high'
                          ? 'text-orange-500'
                          : 'text-slate-500'
                      )}
                    >
                      <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                      {task.priority}
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