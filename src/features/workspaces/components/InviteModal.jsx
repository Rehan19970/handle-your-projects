import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MailPlus, UserPlus, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function InviteModal({ isOpen, onClose, workspaceId, projectId, onInviteSent }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [existingMember, setExistingMember] = useState(null);

  /* Reset on close */
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setRole('member');
      setExistingMember(null);
    }
  }, [isOpen]);

  /* Escape + body scroll lock */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, isLoading, onClose]);

  /* Fetch workspace members when modal opens */
  useEffect(() => {
    if (!isOpen || !workspaceId) return;
    const fetchWorkspace = async () => {
      try {
        const res = await api.get(`/workspaces/${workspaceId}`);
        setWorkspaceMembers(res.data.workspace?.members || []);
      } catch (err) {
        console.error('Failed to load workspace members', err);
      }
    };
    fetchWorkspace();
  }, [isOpen, workspaceId]);

  /* Check existing member */
  useEffect(() => {
    if (!email.trim()) {
      setExistingMember(null);
      return;
    }
    const member = workspaceMembers.find((m) => {
      const memberEmail = m.user?.email?.toLowerCase();
      return memberEmail === email.toLowerCase().trim();
    });
    setExistingMember(member || null);
  }, [email, workspaceMembers]);

  const handleAddToProject = async () => {
    if (!existingMember) return;
    setIsLoading(true);
    try {
      await api.post(`/workspaces/${workspaceId}/projects/${projectId}/members`, {
        userId: existingMember.user._id,
      });
      toast.success(`${existingMember.user.name} added to project!`);
      onInviteSent?.();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to add member'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await api.post(`/workspaces/${workspaceId}/invites`, { email, role });
      toast.success('Invite sent successfully!');
      onInviteSent?.();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to send invite'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal wrapper */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-xl pointer-events-auto border border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                    {projectId ? <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" /> : <MailPlus className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {projectId ? 'Add to Project' : 'Invite Member'}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-500 p-1 -mr-1 rounded-md disabled:opacity-50 shrink-0"
                  aria-label="Close"
                  disabled={isLoading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <form
                onSubmit={handleInvite}
                className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 sm:h-11 text-sm"
                    required
                  />
                </div>

                {existingMember ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        User already in workspace
                      </p>
                    </div>
                    <p className="text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-400 mb-3 leading-relaxed break-words">
                      <strong>{existingMember.user.name}</strong>{' '}
                      ({existingMember.user.email}) is already a member.
                    </p>
                    {projectId ? (
                      <Button
                        type="button"
                        onClick={handleAddToProject}
                        isLoading={isLoading}
                        className="w-full"
                      >
                        Add to Project (No Email)
                      </Button>
                    ) : (
                      <p className="text-[11px] sm:text-xs text-slate-500 italic">
                        This user is already in your workspace.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent h-10 sm:h-11 px-3 text-xs sm:text-sm text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <option value="member">Member (Can edit tasks)</option>
                        <option value="admin">Admin (Can manage projects)</option>
                        <option value="guest">Guest (View only)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Footer — sticky on mobile */}
                <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 sticky bottom-0 bg-white dark:bg-slate-900 -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  {!existingMember && (
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      disabled={!email.trim()}
                      className="w-full sm:w-auto"
                    >
                      Send Invite
                    </Button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}