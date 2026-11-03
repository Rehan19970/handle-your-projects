import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Users, FolderKanban, CheckSquare,
  Crown, Mail, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { getInitials } from '../../../lib/utils';

export default function AdminWorkspaceDetails() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await api.get(`/admin/workspaces/${workspaceId}`);
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load workspace');
        navigate('/admin/workspaces');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkspace();
  }, [workspaceId, navigate]);

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
  const { workspace, stats } = data;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <button
          onClick={() => navigate('/admin/workspaces')}
          className="p-1.5 sm:p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
          aria-label="Back to workspaces"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
            {workspace.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate">
            {workspace.slug}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">Members</p>
              <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                {workspace.members?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">Projects</p>
              <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                {stats.projectCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">Tasks</p>
              <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                {stats.taskCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">Created</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {new Date(workspace.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Owner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
        <h2 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0" /> Owner
        </h2>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs sm:text-base shrink-0 overflow-hidden">
            {workspace.owner?.avatar?.url ? (
              <img
                src={workspace.owner.avatar.url}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials(workspace.owner?.name)
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {workspace.owner?.name}
            </p>
            <p className="text-[11px] sm:text-sm text-slate-500 flex items-center gap-1">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{workspace.owner?.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
            <span className="truncate">
              Members ({workspace.members?.length || 0})
            </span>
          </h2>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {workspace.members?.map((member) => (
            <li
              key={member.user?._id}
              className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm shrink-0 overflow-hidden">
                  {member.user?.avatar?.url ? (
                    <img
                      src={member.user.avatar.url}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(member.user?.name)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {member.user?.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                    {member.user?.email}
                  </p>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-medium bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md capitalize text-slate-600 dark:text-slate-400 shrink-0 whitespace-nowrap">
                {member.role}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Description */}
      {workspace.description && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
          <h2 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
            Description
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            {workspace.description}
          </p>
        </div>
      )}
    </div>
  );
}