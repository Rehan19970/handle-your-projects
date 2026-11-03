import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, ArrowRight } from 'lucide-react';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { getInitials } from '../../../lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const { workspaces, fetchWorkspaces, isLoading } = useWorkspaceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  /* Safe first name */
  const firstName = user?.name?.trim()?.split(' ')[0] || 'there';

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's an overview of your workspaces.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto shrink-0"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          New Workspace
        </Button>
      </div>

      {/* Workspace Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 sm:h-40 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-10 sm:py-20 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <LayoutGrid className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            No workspaces yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5 sm:mb-6 max-w-sm mx-auto leading-relaxed">
            Create your first workspace to start managing projects and
            collaborating with your team.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            Create Workspace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {workspaces.map((ws) => (
            <Link
              key={ws._id}
              to={`/workspace/${ws._id}`}
              className="group block bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm sm:text-xl shrink-0">
                  {getInitials(ws.name)}
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-all -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 shrink-0" />
              </div>

              <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {ws.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {ws.description || 'No description provided.'}
              </p>

              <div className="mt-3 sm:mt-6 flex items-center text-[10px] sm:text-xs font-medium text-slate-500">
                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                  {ws.members?.length || 1}{' '}
                  Member{(ws.members?.length || 1) > 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}