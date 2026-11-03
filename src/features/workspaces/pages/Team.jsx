import { useState, useEffect, useRef } from 'react';
import { UserPlus, Mail, Shield, UserX, Search, Clock, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { InviteModal } from '../components/InviteModal';
import { getInitials } from '../../../lib/utils';

export default function Team() {
  const { activeWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [invites, setInvites] = useState([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const workspace = activeWorkspace;

  /* Fetch pending invites */
  const fetchInvites = async () => {
    if (!workspace?._id) return;
    if (isMountedRef.current) setIsLoadingInvites(true);
    try {
      const res = await api.get(
        `/workspaces/${workspace._id}/invites?status=pending`
      );
      if (isMountedRef.current) setInvites(res.data || []);
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to load invites'
        );
      }
    } finally {
      if (isMountedRef.current) setIsLoadingInvites(false);
    }
  };

  useEffect(() => {
    fetchInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?._id]);

  if (!workspace) {
    return (
      <div className="p-6 sm:p-10 text-center text-xs sm:text-sm text-slate-500">
        Select a workspace to view team.
      </div>
    );
  }

  const filteredMembers =
    workspace.members?.filter((m) => {
      const name = m.user?.name || '';
      const email = m.user?.email || '';
      const searchLower = search.toLowerCase();
      return (
        name.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower)
      );
    }) || [];

  const handleRemoveMember = async (userId) => {
    if (pendingId) return;
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    setPendingId(userId);
    try {
      await api.delete(`/workspaces/${workspace._id}/members/${userId}`);
      toast.success('Member removed');
      fetchWorkspaces();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to remove member'
      );
    } finally {
      if (isMountedRef.current) setPendingId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (pendingId) return;
    setPendingId(userId);
    try {
      await api.patch(`/workspaces/${workspace._id}/members/${userId}`, {
        role: newRole,
      });
      toast.success('Role updated');
      fetchWorkspaces();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update role'
      );
    } finally {
      if (isMountedRef.current) setPendingId(null);
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    if (pendingId) return;
    if (!window.confirm('Revoke this invite?')) return;

    setPendingId(inviteId);
    const previousInvites = invites;
    setInvites(invites.filter((i) => i._id !== inviteId));

    try {
      await api.delete(`/workspaces/${workspace._id}/invites/${inviteId}`);
      toast.success('Invite revoked');
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to revoke invite'
      );
      if (isMountedRef.current) setInvites(previousInvites);
    } finally {
      if (isMountedRef.current) setPendingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Team Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate">
            Manage members and roles for {workspace.name}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search members..."
              className="pl-9 h-9 sm:h-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full sm:w-auto shrink-0"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Invite
          </Button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
            Active Members ({filteredMembers.length})
          </h3>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredMembers.length === 0 ? (
            <li className="p-6 sm:p-10 text-center text-xs sm:text-sm text-slate-500">
              No members found.
            </li>
          ) : (
            filteredMembers.map((member) => {
              const memberId = member.user?._id;
              return (
                <li
                  key={memberId || member.user?.email}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Member info */}
                  <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
                    <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg shrink-0 overflow-hidden">
                      {member.user?.avatar?.url ? (
                        <img
                          src={member.user.avatar.url}
                          alt="avatar"
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(member.user?.name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                          {member.user?.name || 'Unknown User'}
                        </p>
                        {member.role === 'owner' && (
                          <span className="text-[10px] sm:text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 sm:px-2 py-0.5 rounded shrink-0">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-sm text-slate-500 flex items-center gap-1 sm:gap-1.5 mt-0.5">
                        <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        <span className="truncate">
                          {member.user?.email || 'No email'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:gap-4 sm:pl-0 shrink-0">
                    {member.role !== 'owner' ? (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.user._id, e.target.value)
                          }
                          disabled={pendingId !== null}
                          className="text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 sm:px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 flex-1 sm:flex-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="guest">Guest</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.user._id)}
                          disabled={pendingId !== null}
                          className="p-1.5 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40 shrink-0"
                          title="Remove member"
                          aria-label="Remove member"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] sm:text-sm font-medium text-slate-500 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Full Access
                      </span>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Pending Invites Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
            Pending Invites ({invites.length})
          </h3>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {isLoadingInvites ? (
            <li className="p-4 text-center text-xs sm:text-sm text-slate-500">
              Loading invites...
            </li>
          ) : invites.length === 0 ? (
            <li className="p-6 sm:p-8 text-center text-xs sm:text-sm text-slate-500">
              No pending invites.
            </li>
          ) : (
            invites.map((invite) => (
              <li
                key={invite._id}
                className="p-3 sm:p-4 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">
                      {invite.email}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 capitalize">
                      Role: {invite.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeInvite(invite._id)}
                  disabled={pendingId !== null}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40 shrink-0"
                  title="Revoke invite"
                  aria-label="Revoke invite"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspace._id}
        onInviteSent={() => {
          fetchInvites();
          fetchWorkspaces();
        }}
      />
    </div>
  );
}