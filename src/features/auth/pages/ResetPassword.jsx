import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Lock, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '../../../lib/axios';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  /* Auto-redirect after success — cleanup ke saath */
  useEffect(() => {
    if (!isDone) return;
    const timer = setTimeout(() => navigate('/login', { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [isDone, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsDone(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to reset password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter a new password for your account."
    >
      {isDone ? (
        <div className="mt-4 sm:mt-6 text-center space-y-3 sm:space-y-4">
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Password reset!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            Your password has been changed. Redirecting to login...
          </p>
          <Link to="/login" className="block pt-2 sm:pt-4">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
          {/* New password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 pointer-events-none" />
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                className="pl-9 sm:pl-10 pr-9 sm:pr-10"
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-[10px] sm:text-xs text-slate-500">
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 pointer-events-none" />
              <Input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                className="pl-9 sm:pl-10 pr-9 sm:pr-10"
                error={errors.confirmPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Reset Password
          </Button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 py-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back to Login
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}