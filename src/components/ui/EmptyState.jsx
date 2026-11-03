import { Link } from 'react-router-dom';
import { Button } from './Button';

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  actionLink 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
      {/* Icon Container with gradient background */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full" />
        <div className="relative h-20 w-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
          {Icon && <Icon className="h-10 w-10 text-indigo-500" />}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed text-sm">
        {description}
      </p>

      {actionLabel && (
        actionLink ? (
          <Link to={actionLink}>
            <Button>{actionLabel}</Button>
          </Link>
        ) : (
          <Button onClick={onAction}>{actionLabel}</Button>
        )
      )}
    </div>
  );
}