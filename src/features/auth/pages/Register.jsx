import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { User, Mail, Lock } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const inviteEmail = searchParams.get('email');
  const inviteToken = searchParams.get('invite');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (inviteEmail) setValue('email', inviteEmail);
    if (inviteToken) localStorage.setItem('pendingInviteToken', inviteToken);
  }, [inviteEmail, inviteToken, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      login(res.data.user, res.data.accessToken);
      toast.success('Account created successfully!');

      const pendingInvite = localStorage.getItem('pendingInviteToken');
      if (pendingInvite) {
        // Try to accept invite directly
        try {
          const inviteRes = await api.post(`/invites/${pendingInvite}/accept`);
          localStorage.removeItem('pendingInviteToken');
          localStorage.removeItem('tf_workspace_store');
          // SPA navigate — full reload nahi
          navigate(`/workspace/${inviteRes.data.workspace._id}`, { replace: true });
        } catch (err) {
          // Invite accept fail — cleanup aur fallback
          localStorage.removeItem('pendingInviteToken');
          navigate(`/accept-invite/${pendingInvite}`, { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Registration failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={inviteToken ? 'Create Account to Join' : 'Create an account'}
      subtitle={
        inviteToken
          ? "You're joining via an invitation"
          : "Start managing your team's tasks today."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
        <div className="space-y-3 sm:space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 pointer-events-none" />
            <Input
              {...register('name')}
              placeholder="Full Name"
              className="pl-9 sm:pl-10"
              error={errors.name?.message}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 pointer-events-none" />
            <Input
              {...register('email')}
              type="email"
              placeholder="name@company.com"
              className="pl-9 sm:pl-10"
              error={errors.email?.message}
              disabled={!!inviteEmail}
            />
            {inviteEmail && (
              <p className="mt-1 text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400">
                Email locked from invitation
              </p>
            )}
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 pointer-events-none" />
            <Input
              {...register('password')}
              type="password"
              placeholder="Create a strong password"
              className="pl-9 sm:pl-10"
              error={errors.password?.message}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {inviteToken ? 'Create Account & Join' : 'Create Account'}
        </Button>

        <p className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}