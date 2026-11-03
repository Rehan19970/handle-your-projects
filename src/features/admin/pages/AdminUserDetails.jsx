import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Crown, Shield, CheckCircle2,
  Circle, Building2, CheckSquare, TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { getInitials, cn } from '../../../lib/utils';

export default function AdminUserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/admin/users/${userId}`);
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load user');
        navigate('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId, navigate]);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-8 sm:h-10 w-48 sm:w-64" />
        <Skeleton className="h-32 sm:h-40 w-full rounded-xl" />
        <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) return null;
  const { user, workspaces, stats } = data;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-1.5 sm:p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
          aria-label="Back to users"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
            {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate">
            {user.email}
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg sm:text-2xl shrink-0 overflow-hidden">
            {user.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white break-words">
                {user.name}
              </h2>
              {user.role === 'super_admin' && (
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] sm:text-xs font-medium rounded-md shrink-0">
                  <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Super Admin
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 mb-1 break-all">
              <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">{user.email}</span>
            </p>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
              {user.isEmailVerified ? (
                <>
                  <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500 shrink-0" />
                  Email verified
                </>
              ) : (
                <>
                  <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 shrink-0" />
                  Email not verified
                </>
              )}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">Workspaces</p>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            {stats.workspaceCount}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0" />
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">Assigned</p>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            {stats.tasksAssigned}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">Completed</p>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            {stats.tasksCompleted}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 shrink-0" />
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">Created</p>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            {stats.tasksCreated}
          </p>
        </div>
      </div>

      {/* Workspaces */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
            <span className="truncate">Workspaces ({workspaces.length})</span>
          </h2>
        </div>
        {workspaces.length === 0 ? (
          <p className="p-4 sm:p-6 text-xs sm:text-sm text-slate-500 italic">
            Not a member of any workspace
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {workspaces.map((ws) => (
              <li
                key={ws._id}
                className="p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30"
              >
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs sm:text-sm shrink-0">
                      {getInitials(ws.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {ws.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500">
                        {ws.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0 whitespace-nowrap">
                    {ws.owner?.name === user.name ? 'Owner' : 'Member'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}