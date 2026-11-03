import { useState, useEffect, useRef } from 'react';
import { Link as LinkIcon, Search, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Input } from '../../../components/ui/Input';
import { getInitials } from '../../../lib/utils';

export function TaskDependencies({ task, workspaceId, projectId, onTaskUpdate }) {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const searchWrapperRef = useRef(null);
  const isMountedRef = useRef(true);

  const dependencies = task.dependencies || [];

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* Escape + outside click se search panel band */
  useEffect(() => {
    if (!isSearching) return;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsSearching(false);
        setSearch('');
        setResults([]);
      }
    };

    const onClick = (e) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setIsSearching(false);
        setResults([]);
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('touchstart', onClick);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('touchstart', onClick);
    };
  }, [isSearching]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setIsSearching(true);
    try {
      const res = await api.get(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks?search=${encodeURIComponent(search)}`
      );
      if (!isMountedRef.current) return;

      const filtered = (res.data || []).filter(
        (t) =>
          t._id !== task._id &&
          !dependencies.some((dep) => (dep._id || dep) === t._id)
      );
      setResults(filtered);
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to search tasks'
        );
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const addDependency = async (depTask) => {
    if (pendingId) return;
    setPendingId(depTask._id);

    const updatedDependencies = [
      ...dependencies.map((d) => d._id || d),
      depTask._id,
    ];
    onTaskUpdate({ ...task, dependencies: updatedDependencies });

    try {
      await api.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`,
        { dependencies: updatedDependencies }
      );
      toast.success('Dependency added');
      setIsSearching(false);
      setSearch('');
      setResults([]);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to add dependency'
      );
      onTaskUpdate(task);
    } finally {
      setPendingId(null);
    }
  };

  const removeDependency = async (depId) => {
    if (pendingId) return;
    setPendingId(depId);

    const updatedDependencies = dependencies.filter(
      (d) => (d._id || d) !== depId
    );
    onTaskUpdate({ ...task, dependencies: updatedDependencies });

    try {
      await api.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`,
        { dependencies: updatedDependencies }
      );
      toast.success('Dependency removed');
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to remove dependency'
      );
      onTaskUpdate(task);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          Blocked By (Dependencies)
        </h4>
        {dependencies.length > 0 && (
          <span className="text-[10px] sm:text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
            {dependencies.length}
          </span>
        )}
      </div>

      {/* List of dependencies */}
      {dependencies.length > 0 && (
        <ul className="space-y-1.5 sm:space-y-2">
          {dependencies.map((dep) => {
            const depId = dep._id || dep;
            return (
              <li
                key={depId}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                  <LinkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" />
                  <span
                    className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate"
                    title={dep.title || 'Linked task'}
                  >
                    {dep.title || `Task #${String(depId).slice(-4)}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDependency(depId)}
                  disabled={pendingId !== null}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors p-1.5 rounded-md shrink-0 disabled:opacity-40"
                  aria-label="Remove dependency"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Search input */}
      <div ref={searchWrapperRef} className="relative">
        {!isSearching ? (
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Search for a task to link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 sm:h-10 pr-10 text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 p-1 rounded-md disabled:opacity-50"
              disabled={loading || !search.trim()}
              aria-label="Search"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </form>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden">
            {/* Results header */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500">
                Results ({results.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSearching(false);
                  setResults([]);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results list */}
            <ul className="max-h-56 sm:max-h-48 overflow-y-auto">
              {loading ? (
                <li className="p-4 text-center text-xs sm:text-sm text-slate-500">
                  Searching...
                </li>
              ) : results.length === 0 ? (
                <li className="p-4 text-center text-xs sm:text-sm text-slate-500">
                  No tasks found.
                </li>
              ) : (
                results.map((t) => (
                  <li key={t._id}>
                    <button
                      type="button"
                      onClick={() => addDependency(t)}
                      disabled={pendingId !== null}
                      className="w-full text-left flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 disabled:opacity-50"
                    >
                      <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-[10px] shrink-0">
                        {getInitials(t.title)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                          {t.title}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-500 capitalize">
                          {t.priority} priority
                        </p>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}