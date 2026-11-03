import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderKanban } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function CreateProjectModal({ isOpen, onClose, workspaceId, onProjectCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);

  /* Reset form when modal closes */
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setPriority('medium');
    }
  }, [isOpen]);

  /* Escape key + body scroll lock */
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, isLoading, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/projects`, {
        name,
        description,
        priority,
      });
      toast.success('Project created!');
      onProjectCreated(res.data);
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to create project'
      );
    } finally {
      setIsLoading(false);
    }
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
            onClick={() => !isLoading && onClose()}
          />

          {/* Modal wrapper */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-xl pointer-events-auto border border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                    Create Project
                  </h2>
                </div>
                <button
                  onClick={() => !isLoading && onClose()}
                  className="text-slate-400 hover:text-slate-500 transition-colors p-1 -mr-1 rounded-md shrink-0"
                  aria-label="Close"
                  disabled={isLoading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable form body */}
              <form
                onSubmit={handleSubmit}
                className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Project Name
                  </label>
                  <Input
                    placeholder="e.g., Website Redesign"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                  </label>
                  <Input
                    placeholder="What is this project about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent h-10 sm:h-11 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Footer — sticky on mobile */}
                <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 sticky bottom-0 bg-white dark:bg-slate-900 -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={!name.trim()}
                    className="w-full sm:w-auto"
                  >
                    Create Project
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}