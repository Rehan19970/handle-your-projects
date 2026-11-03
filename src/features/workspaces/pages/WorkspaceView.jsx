import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Plus, FolderKanban, ArrowRight, BarChart3, Users, Settings2, MoreVertical,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { Button } from '../../../components/ui/Button';
import { CreateProjectModal } from '../../projects/components/CreateProjectModal';
import { InviteModal } from '../components/InviteModal';
import { StatsCards } from '../../analytics/components/StatsCards';
import { CompletionTrendChart, PriorityChart } from '../../analytics/components/Charts';
import { TeamPerformance } from '../../analytics/components/TeamPerformance';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton, WorkspaceCardSkeleton } from '../../../components/ui/Skeleton';
import { cn } from '../../../lib/utils';

export default function WorkspaceView() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const loadData = useCallback(async () => {
    if (!workspaceId) return;
    if (isMountedRef.current) {
      setIsLoading(true);
      setLoadError(false);
    }
    try {
      const [wsRes, projRes, anaRes] = await Promise.all([
        api.get(`/workspaces/${workspaceId}`),
        api.get(`/workspaces/${workspaceId}/projects`),
        api.get(`/workspaces/${workspaceId}/analytics`),
      ]);

      if (!isMountedRef.current) return;

      const loadedWorkspace = wsRes.data.workspace;
      setWorkspace(loadedWorkspace);
      setActiveWorkspace(loadedWorkspace);
      setProjects(projRes.data || []);
      setAnalytics(anaRes.data || null);
    } catch (error) {
      if (isMountedRef.current) {
        setLoadError(true);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to load workspace data'
        );
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [workspaceId, setActiveWorkspace]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------------- Loading skeleton ---------------- */
  if (isLoading) {
    return (
      <div className="space-y-5 sm:space-y-8 animate-in fade-in px-1 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="min-w-0">
            <Skeleton className="h-7 sm:h-8 w-48 sm:w-64 mb-2" />
            <Skeleton className="h-3 sm:h-4 w-64 sm:w-96" />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Skeleton className="h-9 sm:h-10 w-20 sm:w-24 rounded-lg" />
            <Skeleton className="h-9 sm:h-10 w-28 sm:w-32 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-9 sm:h-10 w-48 sm:w-64 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          <WorkspaceCardSkeleton />
          <WorkspaceCardSkeleton />
          <WorkspaceCardSkeleton />
        </div>
      </div>
    );
  }

  if (loadError || !workspace) {
    return (
      <div className="p-6 sm:p-10 text-center text-xs sm:text-sm text-slate-500">
        {loadError ? 'Failed to load workspace. Please try again.' : 'Workspace not found.'}
        <div className="mt-4">
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {workspace.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 line-clamp-2">
            {workspace.description || 'Manage your projects and track team progress.'}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop buttons */}
          <Button
            variant="outline"
            className="hidden sm:flex"
            onClick={() => navigate(`/workspace/${workspaceId}/settings`)}
          >
            <Settings2 className="h-4 w-4 mr-2" /> Settings
          </Button>
          <Button
            variant="outline"
            className="hidden sm:flex"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <Users className="h-4 w-4 mr-2" /> Invite Team
          </Button>

          {/* Mobile menu (settings + invite) */}
          <div className="relative sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileMenu((v) => !v)}
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showMobileMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMobileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 min-w-[160px]">
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      navigate(`/workspace/${workspaceId}/settings`);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Settings2 className="h-4 w-4" /> Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setIsInviteModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" /> Invite Team
                  </button>
                </div>
              </>
            )}
          </div>

          <Button
            onClick={() => setIsProjectModalOpen(true)}
            className="w-full sm:w-auto shrink-0"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> New Project
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('projects')}
          className={cn(
            'flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2',
            activeTab === 'projects'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          )}
        >
          <FolderKanban className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Projects
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            'flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2',
            activeTab === 'analytics'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          )}
        >
          <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Analytics
        </button>
      </div>

      {/* Content */}
      {activeTab === 'projects' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Create your first project to start managing tasks and collaborating with your team."
                actionLabel="Create Project"
                onAction={() => setIsProjectModalOpen(true)}
              />
            </div>
          ) : (
            projects.map((proj) => (
              <Link
                key={proj._id}
                to={`/workspace/${workspaceId}/project/${proj._id}/board`}
                className="group block bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                  <div
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${proj.color}20`,
                      color: proj.color,
                    }}
                  >
                    <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                  {proj.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {proj.description || 'No description.'}
                </p>

                <div className="mt-3 sm:mt-6 flex items-center justify-between text-[10px] sm:text-xs font-medium text-slate-500">
                  <span>{proj.taskCount || 0} Tasks</span>
                  <span
                    className={cn(
                      'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md capitalize',
                      proj.priority === 'high'
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        : proj.priority === 'medium'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    )}
                  >
                    {proj.priority}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {analytics ? (
            <>
              <StatsCards data={analytics.overview} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-6">
                    Completion Trend (30 Days)
                  </h3>
                  <CompletionTrendChart data={analytics.trend} />
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-6">
                    Tasks by Priority
                  </h3>
                  <PriorityChart data={analytics.priority} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                  Team Performance
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                  Top contributors based on completed tasks.
                </p>
                <TeamPerformance data={analytics.team} />
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-10 text-xs sm:text-sm text-slate-500">
              Analytics data not available.
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        workspaceId={workspaceId}
        onProjectCreated={(newProj) => setProjects((prev) => [newProj, ...prev])}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspaceId}
        projectId={null}
        onInviteSent={() => {
          toast.success('Invite sent!');
        }}
      />
    </div>
  );
}