import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const processOAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error(decodeURIComponent(error) || 'Google login failed');
        navigate('/login', { replace: true });
        return;
      }

      if (!token) {
        toast.error('Invalid authentication response');
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Temporarily set token to fetch user data
        localStorage.setItem('accessToken', token);
        const res = await api.get('/auth/me');

        if (cancelled) return;

        login(res.data, token);
        toast.success('Logged in with Google');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        localStorage.removeItem('accessToken');
        if (cancelled) return;
        toast.error('Failed to complete Google login');
        navigate('/login', { replace: true });
      }
    };

    processOAuth();

    return () => {
      cancelled = true;
    };
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-9 w-9 sm:h-10 sm:w-10 border-b-2 border-indigo-600 mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
          Completing authentication...
        </p>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-1">
          Please wait, this will only take a moment.
        </p>
      </div>
    </div>
  );
}