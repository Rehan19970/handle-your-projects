import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { AuthProvider } from './providers/AuthProvider';
import { SocketProvider } from './providers/SocketProvider'; // ⬅️ NAYA
import { KeyboardShortcutsProvider } from './providers/KeyboardShortcutsProvider';
import { OfflineBanner } from '../components/layout/OfflineBanner';
import { useUIStore } from '../store/useUIStore';
import { useEffect } from 'react';

function App() {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  return (
    <AuthProvider>
      <SocketProvider> {/* ⬅️ NAYA - AuthProvider ke andar hona chahiye */}
        <KeyboardShortcutsProvider>
          <OfflineBanner />
          <RouterProvider router={router} />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: theme === 'dark' ? '#1e293b' : '#ffffff',
                color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
              },
            }}
          />
        </KeyboardShortcutsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;