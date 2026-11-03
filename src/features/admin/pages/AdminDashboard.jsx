import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Building2, FolderKanban, CheckSquare,
  UserPlus, Activity, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../../../lib/axios';
import { Skeleton } from '../../../components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import { cn } from '../../../lib/utils';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewRes, analyticsRes] = await Promise.all([
          api.get('/admin/overview'),
          api.get('/admin/analytics?days=30'),
        ]);
        setOverview(overviewRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        toast.error('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-8 sm:h-10 w-48 sm:w-64" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-24 sm:h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Skeleton className="h-64 sm:h-80 rounded-xl" />
          <Skeleton className="h-64 sm:h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: overview?.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Workspaces', value: overview?.totalWorkspaces || 0, icon: Building2, color: 'bg-emerald-500' },
    { label: 'Total Projects', value: overview?.totalProjects || 0, icon: FolderKanban, color: 'bg-indigo-500' },
    { label: 'Total Tasks', value: overview?.totalTasks || 0, icon: CheckSquare, color: 'bg-purple-500' },
    { label: 'New Users (7d)', value: overview?.recentUsers || 0, icon: UserPlus, color: 'bg-amber-500' },
    { label: 'Active (24h)', value: overview?.activeUsers || 0, icon: Activity, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Platform-wide overview and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-sm font-medium text-slate-500 truncate">
                  {stat.label}
                </p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-1">
                  {stat.value}
                </h3>
              </div>
              <div
                className={cn(
                  'h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg flex items-center justify-center text-white shrink-0',
                  stat.color
                )}
              >
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Signups Trend */}
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
            <h2 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
              New Signups (30 Days)
            </h2>
          </div>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.signupTrend || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSignup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  labelStyle={{ fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorSignup)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workspaces Trend */}
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
            <h2 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
              New Workspaces (30 Days)
            </h2>
          </div>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.workspaceTrend || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  labelStyle={{ fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorWs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Link
          to="/admin/users"
          className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-colors group"
        >
          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500 mb-2 sm:mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600">
            Manage Users
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View, suspend, or promote users
          </p>
        </Link>
        <Link
          to="/admin/workspaces"
          className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-colors group"
        >
          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 mb-2 sm:mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600">
            Manage Workspaces
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View all workspaces and their activity
          </p>
        </Link>
      </div>
    </div>
  );
}