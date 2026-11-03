import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../../../lib/axios';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const forgotSchema = z.object({
  email: z.string().email('Invalid email'),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setIsSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to send reset link'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {isSent ? (
        <div className="mt-4 sm:mt-6 text-center space-y-3 sm:space-y-4">
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Check your email
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            We've sent a password reset link to your email.
            It expires in 15 minutes.
          </p>
          <div className="pt-2 sm:pt-4 space-y-2">
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setIsSent(false)}
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 font-medium px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              Try again with different email
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
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

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send Reset Link
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