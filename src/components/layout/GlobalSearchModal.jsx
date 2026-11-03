import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, FolderKanban, User, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Dummy data for UI demo (Backend API baad mein integrate karenge)
  const results = [
    { type: 'task', title: 'Design Homepage', project: 'Website Redesign', icon: FileText, url: '#' },
    { type: 'project', title: 'Website Redesign', workspace: 'My Team', icon: FolderKanban, url: '/dashboard' },
    { type: 'user', title: 'Rashid Ali', email: 'rashid@example.com', icon: User, url: '/team' },
  ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Input */}
          <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <Search className="h-5 w-5 text-slate-400 mr-3" />
            <input
              autoFocus
              placeholder="Search tasks, projects, or people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-500 text-lg"
            />
            <button onClick={onClose} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 border border-slate-200 dark:border-slate-700">
              Esc
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query === '' ? (
              <div className="p-4 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                <Command className="h-8 w-8 text-slate-300 mb-2" />
                <p>Type to search across your workspace</p>
              </div>
            ) : results.length > 0 ? (
              <ul>
                {results.map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => { navigate(item.url); onClose(); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.project || item.workspace || item.email}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No results found for "{query}"
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}