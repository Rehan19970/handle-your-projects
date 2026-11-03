import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { getInitials } from '../../../lib/utils';

export default function AdminWorkspaces() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/admin/workspaces', {
          params: { search, page, limit: 20 },
        });
        setWorkspaces(res.data);
        setPagination(res.meta?.pagination);
      } catch (error) {
        toast.error('Failed to load workspaces');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchWorkspaces, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="px-1 sm:px-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            View all workspaces on the platform
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search workspaces..."
            className="pl-9 h-10 sm:h-11 text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 sm:p-10 text-center text-sm text-slate-500">
            Loading...
          </div>
        ) : workspaces.length === 0 ? (
          <div className="p-6 sm:p-10 text-center text-sm text-slate-500">
            No workspaces found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 md:p-6">
            {workspaces.map((ws) => (
              <div
                key={ws._id}
                onClick={() => navigate(`/admin/workspaces/${ws._id}`)}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all duration-200 flex flex-col"
              >
                {/* Top row: avatar + slug */}
                <div className="flex items-start justify-between gap-2 mb-2.5 sm:mb-3">
                  <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm sm:text-xl shrink-0">
                    {getInitials(ws.name)}
                  </div>

                  <span className="text-[10px] sm:text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md truncate max-w-[55%]">
                    {ws.slug}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white mb-1 truncate">
                  {ws.name}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-2.5 sm:mb-3 leading-relaxed">
                  {ws.description || 'No description'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs mt-auto pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                  <span className="text-slate-500 flex items-center gap-1 shrink-0">
                    <Users className="h-3 w-3 shrink-0" />
                    {ws.members?.length || 0}
                    <span className="hidden sm:inline">members</span>
                  </span>

                  <span className="text-slate-500 truncate text-right">
                    <span className="hidden sm:inline">Owner: </span>
                    {ws.owner?.name || 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>

          <div className="flex gap-2 justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}