import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, UserX, UserCheck, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { getInitials, cn } from '../../../lib/utils';

export default function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { search, page, limit: 20 },
      });
      setUsers(res.data);
      setPagination(res.meta?.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const toggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      toast.success(res.message);
      setUsers(users.map(u =>
        u._id === userId
          ? { ...u, isActive: res.data.isActive }
          : u
      ));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const makeSuperAdmin = async (userId) => {
    if (!window.confirm('Make this user a Super Admin? They will have full platform access.')) return;
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: 'super_admin' });
      toast.success('User is now Super Admin');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const removeSuperAdmin = async (userId) => {
    if (!window.confirm('Remove Super Admin access from this user?')) return;
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: 'user' });
      toast.success('Super Admin access removed');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  /* ---------- Shared inline pieces ---------- */

  const RoleBadge = ({ role }) =>
    role === 'super_admin' ? (
      <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 whitespace-nowrap">
        <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        Super Admin
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 whitespace-nowrap">
        <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        User
      </span>
    );

  const StatusBadge = ({ isActive }) => (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium whitespace-nowrap',
        isActive
          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
          : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
      )}
    >
      {isActive ? 'Active' : 'Suspended'}
    </span>
  );

  const ActionButtons = ({ user, size = 'md' }) => {
    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-4 w-4 sm:h-4 sm:w-4';
    const btnPad = 'p-1.5 sm:p-2';
    return (
      <div className="flex items-center justify-end gap-1">
        {user.role === 'super_admin' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeSuperAdmin(user._id);
            }}
            className={cn(btnPad, 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg')}
            title="Remove Super Admin"
          >
            <Shield className={iconSize} />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              makeSuperAdmin(user._id);
            }}
            className={cn(btnPad, 'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg')}
            title="Make Super Admin"
          >
            <Crown className={iconSize} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStatus(user._id);
          }}
          className={cn(
            btnPad,
            'rounded-lg',
            user.isActive
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
          )}
          title={user.isActive ? 'Suspend User' : 'Activate User'}
        >
          {user.isActive ? <UserX className={iconSize} /> : <UserCheck className={iconSize} />}
        </button>
      </div>
    );
  };

  const Avatar = ({ user, size = 'md' }) => {
    const s = size === 'md' ? 'h-10 w-10 text-sm' : 'h-10 w-10 text-sm';
    return (
      <div className={cn('rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold overflow-hidden shrink-0', s)}>
        {user.avatar?.url ? (
          <img src={user.avatar.url} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          getInitials(user.name)
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="px-1 sm:px-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Users
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Manage all platform users
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
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
          <div className="p-6 sm:p-10 text-center text-sm text-slate-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-6 sm:p-10 text-center text-sm text-slate-500">No users found</div>
        ) : (
          <>
            {/* ============= MOBILE: Card layout ============= */}
            <ul className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <li
                  key={user._id}
                  onClick={() => navigate(`/admin/users/${user._id}`)}
                  className="p-3 active:bg-slate-50 dark:active:bg-slate-800/30 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <Avatar user={user} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user.email}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <RoleBadge role={user.role} />
                        <StatusBadge isActive={user.isActive} />
                        <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                          {user.workspaceCount || 0} workspaces
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <ActionButtons user={user} size="sm" />
                  </div>
                </li>
              ))}
            </ul>

            {/* ============= DESKTOP: Table layout ============= */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="text-left p-3 sm:p-4 font-medium text-slate-600 dark:text-slate-300">User</th>
                    <th className="text-left p-3 sm:p-4 font-medium text-slate-600 dark:text-slate-300">Role</th>
                    <th className="text-left p-3 sm:p-4 font-medium text-slate-600 dark:text-slate-300">Workspaces</th>
                    <th className="text-left p-3 sm:p-4 font-medium text-slate-600 dark:text-slate-300">Status</th>
                    <th className="text-right p-3 sm:p-4 font-medium text-slate-600 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                    >
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar user={user} />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="p-3 sm:p-4 text-slate-700 dark:text-slate-300">
                        {user.workspaceCount || 0}
                      </td>
                      <td className="p-3 sm:p-4">
                        <StatusBadge isActive={user.isActive} />
                      </td>
                      <td className="p-3 sm:p-4 text-right">
                        <ActionButtons user={user} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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