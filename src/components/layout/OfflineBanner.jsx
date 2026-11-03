import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          // z-index barha diya (999) taake sab ke upar dikhe
          // px-4 add kiya taake text screen ke kinaron se chipke nahi
          // text-xs sm:text-sm kiya taake mobile par ek line mein fit ho
          className="fixed top-0 left-0 right-0 z-[999] bg-red-600 text-white text-center py-2.5 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-lg"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>You're offline. Changes will sync when you reconnect.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}