import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Mail, Lock, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFAUserId, setTwoFAUserId] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const redirectAfterLogin = () => {
    const pendingInvite = localStorage.getItem('pendingInviteToken');
    if (pendingInvite) {
      navigate(`/accept-invite/${pendingInvite}`);
    } else {
      navigate('/dashboard');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);

      if (res.data.requires2FA) {
        setRequires2FA(true);
        setTwoFAUserId(res.data.userId);
        toast.success('Please enter your 2FA code');
      } else {
        login(res.data.user, res.data.accessToken);
        toast.success('Welcome back!');
        redirectAfterLogin();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Login failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    if (twoFACode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-2fa', {
        userId: twoFAUserId,
        code: twoFACode,
      });
      login(res.data.user, res.data.accessToken);
      toast.success('Login successful!');
      redirectAfterLogin();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Invalid 2FA code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your details to access your workspace."
    >
      {!requires2FA ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
          <div className="space-y-3 sm:space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 pointer-events-none" />
              <Input
                {...register('email')}
                type="email"
                placeholder="name@company.com"
                className="pl-9 sm:pl-10"
                error={errors.email?.message}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 pointer-events-none" />
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="pl-9 sm:pl-10"
                error={errors.password?.message}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 py-1 px-0.5"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>

          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
              <span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <p className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handle2FAVerify} className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 sm:p-4 rounded-lg flex items-start gap-2.5 sm:gap-3 text-indigo-700 dark:text-indigo-300">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" />
            <p className="text-xs sm:text-sm leading-relaxed">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>
          <div>
            <Input
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-xl sm:text-2xl tracking-[0.3em] sm:tracking-[0.5em] font-mono h-12 sm:h-14"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Verify & Sign In
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setRequires2FA(false);
              setTwoFACode('');
            }}
          >
            Back to Login
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}