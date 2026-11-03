import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, FolderKanban, User, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Close on Escape + Body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus input with slight delay (mobile keyboard)
      setTimeout(() => inputRef.current?.focus(), 100);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, onClose]);

  // Clear query on close (memory cleanup)
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  // Dummy data for UI demo
  const results = [
    { type: 'task', title: 'Design Homepage', project: 'Website Redesign', icon: FileText, url: '#' },
    { type: 'project', title: 'Website Redesign', workspace: 'My Team', icon: FolderKanban, url: '/dashboard' },
    { type: 'user', title: 'Rashid Ali', email: 'rashid@example.com', icon: User, url: '/team' },
  ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-3 sm:px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input Area */}
          <div className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mr-2 sm:mr-3 shrink-0" />
            <input
              ref={inputRef}
              placeholder="Search tasks, projects, or people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-500 text-sm sm:text-lg min-w-0"
            />
            {/* Esc button — hidden on mobile */}
            <button
              onClick={onClose}
              className="hidden sm:block text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 border border-slate-200 dark:border-slate-700 shrink-0 ml-2"
            >
              Esc
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-1.5 sm:p-2">
            {query === '' ? (
              <div className="p-6 sm:p-4 text-center text-xs sm:text-sm text-slate-500 flex flex-col items-center gap-2">
                <Command className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300 mb-1 sm:mb-2" />
                <p>Type to search across your workspace</p>
              </div>
            ) : results.length > 0 ? (
              <ul className="space-y-0.5">
                {results.map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => {
                        navigate(item.url);
                        onClose();
                      }}
                      className="w-full flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                          {item.project || item.workspace || item.email}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 sm:p-8 text-center text-xs sm:text-sm text-slate-500">
                No results found for "{query}"
              </div>
            )}
          </div>

          {/* Mobile Close Button (Footer) — for easy tap */}
          <div className="sm:hidden p-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              Close Search
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}