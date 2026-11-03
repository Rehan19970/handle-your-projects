import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, QrCode, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function TwoFactorSetup({ isOpen, onClose, onEnabled }) {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Verify, 3: Backup Codes
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /* Reset everything when modal closes */
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setQrCode('');
      setSecret('');
      setCode('');
      setBackupCodes([]);
    }
  }, [isOpen]);

  /* Escape key + body scroll lock */
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) handleClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isLoading]);

  const handleInitiate = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/2fa/setup');
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setStep(2);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to setup 2FA'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/2fa/verify', { code });
      setBackupCodes(res.data.backupCodes);
      setStep(3);
      toast.success('2FA Enabled successfully');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Invalid code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    if (step === 3) onEnabled();
    onClose();
  };

  /* Backdrop click — Step 3 par disable (backup codes protect) */
  const handleBackdropClick = () => {
    if (isLoading) return;
    if (step === 3) return; // Don't lose backup codes accidentally
    handleClose();
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
            onClick={handleBackdropClick}
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
                  <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                    Two-Factor Auth
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-500 p-1 -mr-1 rounded-md shrink-0 disabled:opacity-50"
                  aria-label="Close"
                  disabled={isLoading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {/* Step 1: Welcome */}
                {step === 1 && (
                  <div className="text-center space-y-3.5 sm:space-y-4">
                    <QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-indigo-500 mx-auto" />
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                      Secure your account
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Use an authenticator app like Google Authenticator to add
                      an extra layer of security.
                    </p>
                    <Button
                      onClick={handleInitiate}
                      isLoading={isLoading}
                      className="w-full"
                    >
                      Start Setup
                    </Button>
                  </div>
                )}

                {/* Step 2: Scan & Verify */}
                {step === 2 && (
                  <form onSubmit={handleVerify} className="space-y-3.5 sm:space-y-4">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                        Scan this QR code with your authenticator app.
                      </p>
                      <img
                        src={qrCode}
                        alt="QR Code"
                        className="mx-auto rounded-lg border border-slate-200 dark:border-slate-700 w-36 h-36 sm:w-40 sm:h-40 bg-white p-1"
                      />
                    </div>

                    {/* Manual secret */}
                    <div className="flex items-center gap-1.5 sm:gap-2 justify-center flex-wrap text-xs sm:text-sm">
                      <span className="text-slate-500 shrink-0">Manual:</span>
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] sm:text-xs font-mono text-indigo-600 break-all max-w-[180px] sm:max-w-none">
                        {secret}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(secret)}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                        aria-label="Copy secret"
                      >
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Enter 6-digit code
                      </label>
                      <Input
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        className="text-center text-lg sm:text-xl tracking-[0.4em] sm:tracking-widest font-mono h-11 sm:h-12"
                      />
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                      Verify & Enable
                    </Button>
                  </form>
                )}

                {/* Step 3: Backup Codes */}
                {step === 3 && (
                  <div className="space-y-3.5 sm:space-y-4">
                    <div className="text-center">
                      <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500 mx-auto mb-2" />
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                        Save these backup codes!
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                        You won't see them again. Store them somewhere safe.
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-lg grid grid-cols-2 gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-sm text-slate-700 dark:text-slate-300">
                      {backupCodes.map((c) => (
                        <div key={c} className="break-all">
                          {c}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => copyToClipboard(backupCodes.join('\n'))}
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy All
                    </Button>

                    <Button onClick={handleClose} className="w-full">
                      Done
                    </Button>

                    <p className="text-center text-[10px] sm:text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ Save these codes before closing
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}