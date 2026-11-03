import { useState, useRef, useEffect } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { cn } from '../../../lib/utils';
import { Input } from '../../../components/ui/Input';

export function TaskChecklist({ task, workspaceId, projectId, onTaskUpdate }) {
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [pendingIndex, setPendingIndex] = useState(null);
  const inputRef = useRef(null);

  const checklist = task.checklist || [];

  /* Cancel add on Escape */
  useEffect(() => {
    if (!isAdding) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsAdding(false);
        setNewItem('');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isAdding]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const updatedChecklist = [
      ...checklist,
      { text: newItem.trim(), isCompleted: false },
    ];

    onTaskUpdate({ ...task, checklist: updatedChecklist });
    setNewItem('');

    try {
      await api.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`,
        { checklist: updatedChecklist }
      );
      setIsAdding(false);
      toast.success('Sub-task added');
    } catch (error) {
      toast.error('Failed to add sub-task');
      onTaskUpdate(task);
    }
  };

  const toggleItem = async (index) => {
    if (pendingIndex !== null) return;
    setPendingIndex(index);

    const updatedChecklist = checklist.map((item, i) =>
      i === index ? { ...item, isCompleted: !item.isCompleted } : item
    );

    onTaskUpdate({ ...task, checklist: updatedChecklist });

    try {
      await api.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`,
        { checklist: updatedChecklist }
      );
    } catch (error) {
      toast.error('Failed to update checklist');
      onTaskUpdate(task);
    } finally {
      setPendingIndex(null);
    }
  };

  const removeItem = async (index) => {
    if (pendingIndex !== null) return;
    setPendingIndex(index);

    const updatedChecklist = checklist.filter((_, i) => i !== index);
    onTaskUpdate({ ...task, checklist: updatedChecklist });

    try {
      await api.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`,
        { checklist: updatedChecklist }
      );
    } catch (error) {
      toast.error('Failed to remove item');
      onTaskUpdate(task);
    } finally {
      setPendingIndex(null);
    }
  };

  const completedCount = checklist.filter((i) => i.isCompleted).length;
  const progress =
    checklist.length === 0
      ? 0
      : Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
          Checklist
          <span className="text-[10px] sm:text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 rounded-full">
            {completedCount}/{checklist.length}
          </span>
        </h4>
      </div>

      {/* Progress Bar */}
      {checklist.length > 0 && (
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* List */}
      <ul className="space-y-1.5 sm:space-y-2">
        {checklist.map((item, index) => (
          <li
            key={item._id || `${index}-${item.text}`}
            className="group flex items-start gap-2 sm:gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {/* Checkbox — larger tap target */}
            <button
              type="button"
              onClick={() => toggleItem(index)}
              disabled={pendingIndex !== null}
              className={cn(
                'shrink-0 mt-0.5 h-5 w-5 sm:h-4 sm:w-4 rounded border flex items-center justify-center transition-colors',
                'disabled:opacity-60',
                item.isCompleted
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
              )}
              aria-label={
                item.isCompleted ? 'Mark incomplete' : 'Mark complete'
              }
            >
              {item.isCompleted && <Check className="h-3 w-3" />}
            </button>

            {/* Text */}
            <span
              className={cn(
                'flex-1 text-xs sm:text-sm break-words min-w-0 leading-relaxed',
                item.isCompleted
                  ? 'text-slate-400 line-through'
                  : 'text-slate-700 dark:text-slate-300'
              )}
            >
              {item.text}
            </span>

            {/* Delete — always visible on mobile, hover on desktop */}
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={pendingIndex !== null}
              className={cn(
                'shrink-0 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all',
                'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100',
                'disabled:opacity-40'
              )}
              aria-label="Delete item"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </li>
        ))}
      </ul>

      {/* Add New Item */}
      {isAdding ? (
        <form
          onSubmit={handleAddItem}
          className="flex items-center gap-1.5 sm:gap-2 mt-2"
        >
          <Input
            ref={inputRef}
            placeholder="Add a sub-task..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="h-9 text-sm flex-1 min-w-0"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newItem.trim()}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 shrink-0"
            aria-label="Add"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewItem('');
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
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Add sub-task
        </button>
      )}
    </div>
  );
}