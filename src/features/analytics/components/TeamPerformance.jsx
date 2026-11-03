import { Trophy } from 'lucide-react';
import { getInitials } from '../../../lib/utils';

export function TeamPerformance({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center text-xs sm:text-sm text-slate-500">
        No assigned tasks yet.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 sm:space-y-4">
      {data.map((member, index) => (
        <div
          key={member.userId}
          className="flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          {/* Left: avatar + name/email */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-[10px] sm:text-sm border border-indigo-200 dark:border-indigo-800 overflow-hidden">
                {member.avatar?.url ? (
                  <img
                    src={member.avatar.url}
                    alt={member.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(member.name)
                )}
              </div>
              {index === 0 && (
                <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-amber-100 text-amber-600 rounded-full p-0.5 sm:p-1 border-2 border-white dark:border-slate-900">
                  <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                {member.name}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {member.email}
              </p>
            </div>
          </div>

          {/* Right: completed + progress */}
          <div className="text-right shrink-0">
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
              {member.completed}{' '}
              <span className="text-[10px] sm:text-xs font-normal text-slate-500">done</span>
            </p>
            <div className="w-16 sm:w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1 sm:h-1.5 mt-1 ml-auto">
              <div
                className="bg-indigo-500 h-1 sm:h-1.5 rounded-full"
                style={{ width: `${member.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}