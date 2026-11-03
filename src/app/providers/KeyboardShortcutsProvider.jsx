import { useEffect } from 'react';

export function KeyboardShortcutsProvider({ children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K → Open Global Search Modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Dispatch a custom event that Topbar will listen to
        document.dispatchEvent(new CustomEvent('open-command-palette'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Dependency array khali kar diya

  return children;
}