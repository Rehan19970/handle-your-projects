import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlignLeft, Calendar, Flag, CheckSquare,
  Paperclip, Activity, UploadCloud, File as FileIcon, MessageSquare,
  Users, AlertCircle, Link as LinkIcon, Search, Plus, Trash2, Repeat, Bell, Sparkles,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { cn, getInitials } from '../../../lib/utils';
import { TaskChecklist } from './TaskChecklist';
import { TaskActivityFeed } from './TaskActivityFeed';
import { CommentSection } from '../../comments/components/CommentSection';

/* ============================================================ */
/*  Inline: TaskDependencies                                    */
/* ============================================================ */
const TaskDependencies = ({ task, workspaceId, projectId, onTaskUpdate }) => {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const dependencies = task.dependencies || [];

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setIsSearching(true);
    try {
      const res = await api.get(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks?search=${encodeURIComponent(search)}`
      );
      const filtered = (res.data || []).filter(
        (t) =>
          t._id !== task._id &&
          !dependencies.some((dep) => (dep._id || dep) === t._id)
      );
      setResults(filtered);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to search tasks'
      );
    } finally {
      setLoading(false);
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
        error?.response?.data?.message || error?.message || 'Failed to add dependency'
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
        error?.response?.data?.message || error?.message || 'Failed to remove dependency'
      );
      onTaskUpdate(task);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
        <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        Blocked By (Dependencies)
      </h4>

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
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-md shrink-0 disabled:opacity-40"
                  aria-label="Remove dependency"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

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
            disabled={loading || !search.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 p-1 rounded-md disabled:opacity-50"
            aria-label="Search"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500">
              Results ({results.length})
            </span>
            <button
              type="button"
              onClick={() => { setIsSearching(false); setResults([]); }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="max-h-56 sm:max-h-48 overflow-y-auto">
            {loading ? (
              <li className="p-4 text-center text-xs sm:text-sm text-slate-500">Searching...</li>
            ) : results.length === 0 ? (
              <li className="p-4 text-center text-xs sm:text-sm text-slate-500">No tasks found.</li>
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
  );
};

/* ============================================================ */
/*  Inline: TaskCustomFields                                    */
/* ============================================================ */
const TaskCustomFields = ({ task, workspaceId, projectId, onTaskUpdate }) => {
  const [newFieldName, setNewFieldName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [pendingIndex, setPendingIndex] = useState(null);
  const customFields = task.customFields || [];
  const debounceTimers = useRef({});

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    const updatedFields = [...customFields, { name: newFieldName.trim(), value: '' }];
    onTaskUpdate({ ...task, customFields: updatedFields });
    setNewFieldName('');
    setIsAdding(false);
    try {
      await api.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`,
        { customFields: updatedFields }
      );
      toast.success('Custom field added');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add field');
      onTaskUpdate(task);
    }
  };

  const handleValueChange = useCallback(
    (index, newValue) => {
      const updatedFields = customFields.map((field, i) =>
        i === index ? { ...field, value: newValue } : field
      );
      onTaskUpdate({ ...task, customFields: updatedFields });

      if (debounceTimers.current[index]) {
        clearTimeout(debounceTimers.current[index]);
      }
      debounceTimers.current[index] = setTimeout(async () => {
        try {
          await api.patch(
            `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`,
            { customFields: updatedFields }
          );
        } catch (error) {
          toast.error('Failed to update field');
          onTaskUpdate(task);
        }
      }, 600);
    },
    [customFields, task, workspaceId, projectId, onTaskUpdate]
  );

  const removeField = async (index) => {
    if (pendingIndex !== null) return;
    setPendingIndex(index);
    const updatedFields = customFields.filter((_, i) => i !== index);
    onTaskUpdate({ ...task, customFields: updatedFields });
    try {
      await api.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`,
        { customFields: updatedFields }
      );
    } catch (error) {
      toast.error('Failed to remove field');
      onTaskUpdate(task);
    } finally {
      setPendingIndex(null);
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-4 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
          <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Custom Fields
        </h4>
      </div>
      <ul className="space-y-2">
        {customFields.map((field, index) => (
          <li
            key={field._id || `${index}-${field.name}`}
            className="group flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 p-2 sm:p-0 rounded-md sm:rounded-none hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:hover:bg-transparent"
          >
            <div className="sm:w-1/3 text-[11px] sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate px-1 sm:px-0">
              {field.name}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
              <Input
                value={field.value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                placeholder={`Enter ${field.name.toLowerCase()}...`}
                className="h-9 text-sm flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={() => removeField(index)}
                disabled={pendingIndex !== null}
                className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-40"
                aria-label="Delete field"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {isAdding ? (
        <form onSubmit={handleAddField} className="flex items-center gap-1.5 sm:gap-2 mt-2">
          <Input
            autoFocus
            placeholder="Field name (e.g., Story Points)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="h-9 text-sm flex-1 min-w-0"
          />
          <button
            type="submit"
            disabled={!newFieldName.trim()}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 shrink-0"
            aria-label="Add"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { setIsAdding(false); setNewFieldName(''); }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-md shrink-0"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mt-1.5 sm:mt-2 p-1 -ml-1 rounded-md"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Add custom field
        </button>
      )}
    </div>
  );
};

/* ============================================================ */
/*  Inline: TaskRecurrence                                      */
/* ============================================================ */
const TaskRecurrence = ({ task, workspaceId, projectId, onTaskUpdate }) => {
  const [isRecurring, setIsRecurring] = useState(task.recurrence?.isRecurring || false);
  const [frequency, setFrequency] = useState(task.recurrence?.frequency || 'weekly');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const recurrenceData = {
      isRecurring,
      frequency: isRecurring ? frequency : null,
      nextOccurrence: isRecurring ? new Date().toISOString() : null,
    };
    try {
      await api.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`,
        { recurrence: recurrenceData }
      );
      onTaskUpdate({ ...task, recurrence: recurrenceData });
      toast.success(isRecurring ? 'Task is now recurring' : 'Recurrence removed');
    } catch (error) {
      toast.error('Failed to update recurrence');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-4 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
        <Repeat className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Recurring Task
      </h4>
      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3 sm:space-y-4">
        <label className="flex items-center gap-2.5 sm:gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
          />
          <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            Make this task repeat automatically
          </span>
        </label>
        {isRecurring && (
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Repeats every</span>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="h-8 sm:h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs sm:text-sm text-slate-900 dark:text-white shrink-0"
            >
              <option value="daily">Day</option>
              <option value="weekly">Week</option>
              <option value="monthly">Month</option>
            </select>
          </div>
        )}
        {isRecurring && (
          <Button size="sm" onClick={handleSave} isLoading={isSaving} className="w-full sm:w-auto">
            Save Recurrence
          </Button>
        )}
      </div>
    </div>
  );
};

/* ============================================================ */
/*  MAIN TASK MODAL                                             */
/* ============================================================ */
export function TaskModal({
  isOpen, onClose, task, workspaceId, projectId,
  columns, workspaceMembers = [], onTaskSaved,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    columnId: columns[0]?.id || 'todo',
    priority: 'medium',
    dueDate: '',
    assignees: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const fileInputRef = useRef(null);
  const [currentTask, setCurrentTask] = useState(task);
  const isEditing = !!currentTask?._id;

  /* Body scroll lock */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, isLoading, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setCurrentTask(task);
        setFormData({
          title: task.title || '',
          description: task.description || '',
          columnId: task.columnId || columns[0]?.id,
          priority: task.priority || 'medium',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          assignees: task.assignees?.map((a) => a._id || a).filter(Boolean) || [],
        });
      } else {
        setCurrentTask(null);
        setFormData({
          title: '', description: '', columnId: columns[0]?.id || 'todo',
          priority: 'medium', dueDate: '', assignees: [],
        });
      }
      setActiveTab('details');
    }
  }, [task, columns, isOpen]);

  const handleSaveTask = async () => {
    if (!formData.title.trim()) return toast.error('Title is required');
    setIsLoading(true);
    try {
      if (isEditing) {
        const res = await api.patch(
          `/workspaces/${workspaceId}/projects/${projectId}/tasks/${currentTask._id}`,
          formData
        );
        toast.success('Task updated');
        onTaskSaved(res.data);
        onClose();
      } else {
        const res = await api.post(
          `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
          formData
        );
        toast.success('Task created');
        onTaskSaved(res.data);
        setCurrentTask(res.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.title.trim()) return toast.error('Please enter a title first');
    setIsGeneratingAI(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/ai/generate`, {
        title: formData.title,
      });
      const { description, subtasks } = res.data;
      setFormData((prev) => ({ ...prev, description }));
      if (isEditing && subtasks?.length) {
        const newChecklist = [
          ...(currentTask.checklist || []),
          ...subtasks.map((t) => ({ text: t, isCompleted: false })),
        ];
        await api.patch(
          `/workspaces/${workspaceId}/projects/${projectId}/tasks/${currentTask._id}`,
          { checklist: newChecklist }
        );
        onTaskSaved({ ...currentTask, checklist: newChecklist, description });
      }
      toast.success('AI generated details!');
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'AI Generation failed');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const toggleAssignee = (userId) => {
    setFormData((prev) => {
      const isAssigned = prev.assignees.includes(userId);
      return {
        ...prev,
        assignees: isAssigned
          ? prev.assignees.filter((id) => id !== userId)
          : [...prev.assignees, userId],
      };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentTask?._id) return;
    const uploadData = new FormData();
    uploadData.append('files', file);
    setIsUploading(true);
    try {
      const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${currentTask._id}/attachments`,
        uploadData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('File uploaded');
      const updatedTask = {
        ...currentTask,
        attachments: [...(currentTask.attachments || []), ...res.data],
      };
      setCurrentTask(updatedTask);
      onTaskSaved(updatedTask);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !currentTask?._id) return;
    await handleFileUpload({ target: { files: [file] } });
  };

  const handleTaskPartialUpdate = (updatedTask) => {
    setCurrentTask(updatedTask);
    onTaskSaved(updatedTask);
  };

  const validMembers = workspaceMembers.filter((m) => m?.user?._id);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full sm:max-w-4xl bg-white dark:bg-slate-900 rounded-t-xl sm:rounded-xl shadow-2xl pointer-events-auto border border-slate-200 dark:border-slate-800 flex flex-col h-[95dvh] sm:max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                    <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h2 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {isEditing ? `Task #${currentTask._id.slice(-4)}` : 'Create New Task'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-500 transition-colors p-1.5 -mr-1 rounded-md shrink-0"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              {isEditing && (
                <div className="flex border-b border-slate-100 dark:border-slate-800 px-2 sm:px-4 gap-4 sm:gap-6 shrink-0 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'details', label: 'Details', icon: null },
                    { id: 'activity', label: 'Activity', icon: Activity },
                    { id: 'comments', label: 'Comments', icon: MessageSquare },
                    { id: 'updates', label: 'Updates', icon: Bell, amber: true },
                  ].map(({ id, label, icon: Icon, amber }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={cn(
                        'py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 sm:gap-2 shrink-0',
                        activeTab === id
                          ? amber
                            ? 'border-amber-500 text-amber-600'
                            : 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                {activeTab === 'details' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Title */}
                    <div>
                      <Input
                        placeholder="Task title..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="text-sm sm:text-lg font-medium h-10 sm:h-12 border-none px-0 focus-visible:ring-0 shadow-none bg-transparent"
                      />
                      <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mt-1" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                          <AlignLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Description
                        </label>
                        <button
                          type="button"
                          onClick={handleAIGenerate}
                          disabled={isGeneratingAI}
                          className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50"
                        >
                          {isGeneratingAI ? (
                            <span className="animate-pulse">Generating...</span>
                          ) : (
                            <><Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Auto-Fill with AI</>
                          )}
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="Add more details about this task..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none"
                      />
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                          <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent h-10 sm:h-11 px-3 text-sm text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Due Date
                        </label>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent h-10 sm:h-11 px-3 text-sm text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                          <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Status
                        </label>
                        <select
                          value={formData.columnId}
                          onChange={(e) => setFormData({ ...formData, columnId: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent h-10 sm:h-11 px-3 text-sm text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          {columns.map((col) => (
                            <option key={col.id} value={col.id}>{col.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Assignees */}
                    <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                      <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Assignees
                      </label>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {validMembers.map((member) => {
                          const isAssigned = formData.assignees.includes(member.user._id);
                          return (
                            <button
                              key={member.user._id}
                              type="button"
                              onClick={() => toggleAssignee(member.user._id)}
                              className={cn(
                                'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border text-xs sm:text-sm transition-colors',
                                isAssigned
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                              )}
                            >
                              <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] sm:text-[9px] text-white font-bold overflow-hidden shrink-0">
                                {member.user.avatar?.url ? (
                                  <img src={member.user.avatar.url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  getInitials(member.user.name)
                                )}
                              </div>
                              <span className="truncate max-w-[100px] sm:max-w-none">{member.user.name}</span>
                            </button>
                          );
                        })}
                        {validMembers.length === 0 && (
                          <p className="text-xs sm:text-sm text-slate-500 italic">No members available.</p>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                        <TaskChecklist task={currentTask} workspaceId={workspaceId} projectId={projectId} onTaskUpdate={handleTaskPartialUpdate} />
                      </div>
                    )}
                    {isEditing && <TaskCustomFields task={currentTask} workspaceId={workspaceId} projectId={projectId} onTaskUpdate={handleTaskPartialUpdate} />}
                    {isEditing && <TaskDependencies task={currentTask} workspaceId={workspaceId} projectId={projectId} onTaskUpdate={handleTaskPartialUpdate} />}
                    {isEditing && <TaskRecurrence task={currentTask} workspaceId={workspaceId} projectId={projectId} onTaskUpdate={handleTaskPartialUpdate} />}

                    {/* Attachments */}
                    {isEditing && (
                      <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                            <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Attachments
                          </h4>
                          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            isLoading={isUploading}
                          >
                            <UploadCloud className="h-4 w-4 mr-2" /> Upload File
                          </Button>
                        </div>
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={cn(
                            'border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors mb-3 sm:mb-4',
                            isDragging
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          )}
                        >
                          <UploadCloud className={cn('h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2', isDragging ? 'text-indigo-500' : 'text-slate-400')} />
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            {isDragging ? 'Drop file here to upload' : 'Drag & drop files here, or click Upload File'}
                          </p>
                        </div>
                        {currentTask.attachments && currentTask.attachments.length > 0 ? (
                          <ul className="space-y-2">
                            {currentTask.attachments.map((att) => (
                              <li
                                key={att._id}
                                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0 flex-1">
                                  <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 truncate"
                                    title={att.fileName}
                                  >
                                    {att.fileName}
                                  </a>
                                </div>
                                <span className="text-[10px] sm:text-xs text-slate-500 shrink-0">
                                  {(att.size / 1024).toFixed(1)} KB
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-500 italic">No attachments yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && <TaskActivityFeed taskId={currentTask._id} workspaceId={workspaceId} />}
                {activeTab === 'comments' && (
                  <CommentSection workspaceId={workspaceId} projectId={projectId} taskId={currentTask._id} type="comment" />
                )}
                {activeTab === 'updates' && (
                  <CommentSection workspaceId={workspaceId} projectId={projectId} taskId={currentTask._id} type="update" />
                )}
              </div>

              {/* Footer */}
              <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 shrink-0">
                <div className="text-[10px] sm:text-xs text-slate-500 text-center sm:text-left">
                  {isEditing && currentTask.updatedAt && `Last updated ${new Date(currentTask.updatedAt).toLocaleDateString()}`}
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                  <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
                    Close
                  </Button>
                  {activeTab === 'details' && (
                    <Button
                      type="button"
                      onClick={handleSaveTask}
                      isLoading={isLoading}
                      disabled={!formData.title.trim()}
                      className="w-full sm:w-auto"
                    >
                      {isEditing ? 'Save Changes' : 'Create Task'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}