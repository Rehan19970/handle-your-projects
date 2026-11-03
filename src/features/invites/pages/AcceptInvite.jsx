import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { getInitials } from '../../../lib/utils';

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [status, setStatus] = useState('loading');
  const [inviteData, setInviteData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;

    const processInvite = async () => {
      try {
        localStorage.setItem('pendingInviteToken', token);

        const res = await api.get(`/invites/${token}/metadata`);
        if (!isMounted) return;
        setInviteData(res.data);

        if (user) {
          if (user.email !== res.data.email) {
            setStatus('wrong-account');
          } else {
            setStatus('ready-to-accept');
          }
          return;
        }

        const emailCheck = await api.post('/auth/check-email', {
          email: res.data.email,
        });
        if (!isMounted) return;

        if (emailCheck.data.exists) {
          navigate(`/login?invite=${token}`, { replace: true });
        } else {
          navigate(
            `/register?invite=${token}&email=${res.data.email}`,
            { replace: true }
          );
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
          setErrorMsg(
            error?.response?.data?.message ||
              error?.message ||
              'Invite invalid or expired'
          );
        }
      }
    };

    processInvite();

    return () => {
      isMounted = false;
    };
  }, [token, user?._id, navigate]);

  /* Auto-redirect after success — cleanup ke saath */
  useEffect(() => {
    if (status !== 'success' || !inviteData?.workspace?._id) return;
    const timer = setTimeout(() => {
      navigate(`/workspace/${inviteData.workspace._id}`, { replace: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [status, inviteData, navigate]);

  const handleAccept = async () => {
    setStatus('loading');
    try {
      const res = await api.post(`/invites/${token}/accept`);
      toast.success('Joined workspace successfully!');

      localStorage.removeItem('pendingInviteToken');
      localStorage.removeItem('tf_workspace_store');

      setInviteData((prev) => ({
        ...prev,
        workspace: res.data.workspace || prev?.workspace,
      }));
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to accept invite'
      );
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 text-center"
      >
        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center py-2">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-500 animate-spin mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Processing invite...
            </h2>
          </div>
        )}

        {/* Wrong account */}
        {status === 'wrong-account' && inviteData && (
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Wrong Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6 leading-relaxed break-words">
              This invite was sent to{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {inviteData.email}
              </strong>
              . You are logged in as{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {user?.email}
              </strong>
              .
            </p>
            <div className="w-full space-y-2">
              <Button
                onClick={() => navigate(`/login?invite=${token}`)}
                className="w-full"
              >
                Switch Account
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Ready to accept */}
        {status === 'ready-to-accept' && inviteData && (
          <div className="flex flex-col items-center">
            {/* Workspace avatar */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg sm:text-2xl mb-3 sm:mb-4 shadow-lg shadow-indigo-500/30 overflow-hidden">
              {inviteData.workspace?.logo?.url ? (
                <img
                  src={inviteData.workspace.logo.url}
                  alt={inviteData.workspace.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(inviteData.workspace?.name)
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 break-words">
              Join {inviteData.workspace?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6 leading-relaxed">
              You've been invited to join this workspace. Click below to accept
              the invite.
            </p>
            <Button onClick={handleAccept} className="w-full">
              Accept Invite
            </Button>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="flex flex-col items-center py-2">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome aboard!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Redirecting to workspace...
            </p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Invalid Invite
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6 leading-relaxed break-words">
              {errorMsg}
            </p>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}