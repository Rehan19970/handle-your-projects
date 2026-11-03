import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PermissionsView } from '../components/PermissionsView';

export default function WorkspaceSettings() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const workspace = workspaces.find((w) => w._id === workspaceId);

  const [name, setName] = useState(workspace?.name || '');
  const [description, setDescription] = useState(workspace?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description || '');
    }
  }, [workspace]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    setIsSaving(true);
    try {
      await api.patch(`/workspaces/${workspaceId}`, { name, description });
      toast.success('Workspace updated');
      fetchWorkspaces();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update workspace'
      );
    } finally {
      if (isMountedRef.current) setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you ABSOLUTELY sure? This will delete all projects and tasks permanently.'
      )
    )
      return;

    setIsDeleting(true);
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      toast.success('Workspace deleted');
      fetchWorkspaces();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to delete workspace'
      );
    } finally {
      if (isMountedRef.current) setIsDeleting(false);
    }
  };

  /* Better loading state */
  if (!workspace) {
    return (
      <div className="p-6 sm:p-10 text-center text-xs sm:text-sm text-slate-500">
        Workspace not found or still loading...
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 max-w-4xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
          <Settings2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-slate-400 shrink-0" />
          Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your workspace preferences and configuration.
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white">
            General
          </h2>
        </div>
        <form onSubmit={handleUpdate} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Workspace Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 sm:h-11 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 sm:h-11 text-sm"
            />
          </div>
          <Button
            type="submit"
            isLoading={isSaving}
            className="w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </form>
      </div>

      {/* Permissions View */}
      <PermissionsView />

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 overflow-hidden mt-5 sm:mt-8">
        <div className="p-4 sm:p-6 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
          <h2 className="text-sm sm:text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5 sm:gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" /> Danger Zone
          </h2>
        </div>
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">
              Delete Workspace
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
              Once deleted, all projects and tasks will be gone forever.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="w-full sm:w-auto shrink-0"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}