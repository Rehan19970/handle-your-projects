import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-[100dvh] bg-slate-50 dark:bg-slate-950">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-600 dark:bg-indigo-900">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-800 dark:from-indigo-800 dark:to-slate-900" />
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 text-white w-full">
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tight">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Layers className="w-6 h-6 text-white" />
            </div>
            TaskForge
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-5 xl:mb-6">
              Manage your team's work <br />
              <span className="text-indigo-200">without the chaos.</span>
            </h1>
            <p className="text-indigo-100 text-base xl:text-lg max-w-md">
              TaskForge is the visual workspace for teams that want to get things done. Kanban boards, real-time sync, and powerful analytics.
            </p>
          </motion.div>

          <div className="flex items-center gap-4 text-sm text-indigo-200">
            <p>© {new Date().getFullYear()} TaskForge. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-6 sm:space-y-8 py-6 sm:py-0"
        >
          {/* Mobile branding (shown only on small screens) */}
          <div className="lg:hidden flex flex-col items-center text-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              TaskForge
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}