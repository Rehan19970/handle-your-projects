import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, Tag, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function TaskCustomFields({ task, workspaceId, projectId, onTaskUpdate }) {
  const [newFieldName, setNewFieldName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [pendingIndex, setPendingIndex] = useState(null);

  const customFields = task.customFields || [];
  const debounceTimers = useRef({});
  const latestValues = useRef({});

  /* Cancel add on Escape */
  useEffect(() => {
    if (!isAdding) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsAdding(false);
        setNewFieldName('');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isAdding]);

  /* Cleanup debounce timers on unmount */
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const updatedFields = [
      ...customFields,
      { name: newFieldName.trim(), value: '' },
    ];

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
      toast.error('Failed to add field');
      onTaskUpdate(task);
    }
  };

  /* Debounced value change — har keystroke par API call nahi */
  const handleValueChange = useCallback(
    (index, newValue) => {
      const updatedFields = customFields.map((field, i) =>
        i === index ? { ...field, value: newValue } : field
      );

      onTaskUpdate({ ...task, customFields: updatedFields });

      latestValues.current[index] = newValue;

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
    <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
          <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Custom Fields
        </h4>
      </div>

      {/* List */}
      <ul className="space-y-2 sm:space-y-2.5">
        {customFields.map((field, index) => (
          <li
            key={field._id || `${index}-${field.name}`}
            className="group flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 p-2 sm:p-0 rounded-md sm:rounded-none hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:hover:bg-transparent"
          >
            {/* Field name */}
            <div className="sm:w-1/3 text-[11px] sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate px-1 sm:px-0">
              {field.name}
            </div>

            {/* Input + delete row */}
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
                className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 disabled:opacity-40"
                aria-label={`Delete ${field.name}`}
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Add new field */}
      {isAdding ? (
        <form
          onSubmit={handleAddField}
          className="flex items-center gap-1.5 sm:gap-2 mt-2"
        >
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
            aria-label="Add field"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewFieldName('');
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
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
}