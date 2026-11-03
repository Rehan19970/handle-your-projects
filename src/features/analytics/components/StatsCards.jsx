import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';

export function StatsCards({ data }) {
  const stats = [
    { title: 'Total Tasks', value: data?.totalTasks || 0, icon: ListTodo, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' },
    { title: 'Completed', value: data?.completedTasks || 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { title: 'Overdue', value: data?.overdueTasks || 0, icon: AlertCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' },
    { title: 'Completion Rate', value: `${data?.completionRate || 0}%`, icon: Clock, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-slate-900 p-3 sm:p-5 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2.5 sm:gap-4 min-w-0"
        >
          <div className={`p-2 sm:p-3 rounded-lg shrink-0 ${stat.color}`}>
            <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
              {stat.title}
            </p>
            <h3 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-1 truncate">
              {stat.value}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}