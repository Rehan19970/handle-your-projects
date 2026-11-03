import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, Paperclip, AlignLeft, AlertCircle } from 'lucide-react';
import { formatDueDate, getDueDateColor } from '../../../lib/dateUtils';
import { getInitials, cn } from '../../../lib/utils';

export function TaskCard({ task, onClick }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { type: 'Task', task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const priorityColors = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  const isBlocked = task.dependencies?.length > 0;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-indigo-50/60 dark:bg-indigo-900/20 border-2 border-indigo-500 border-dashed rounded-lg p-3 sm:p-4 min-h-[100px] opacity-60 pointer-events-none"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-lg p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all touch-manipulation"
    >
      {/* Tags / Priority / Blocked */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
        <span
          className={cn(
            'text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shrink-0',
            priorityColors[task.priority]
          )}
        >
          {task.priority}
        </span>
        {isBlocked && (
          <span
            className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0"
            title="Blocked by another task"
          >
            <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Blocked
          </span>
        )}
        {task.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[9px] sm:text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[80px] sm:max-w-[120px]"
            title={tag}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-1.5 sm:mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Custom Fields Preview */}
      {task.customFields?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          {task.customFields.slice(0, 2).map((field, idx) => (
            <span
              key={idx}
              className="text-[9px] sm:text-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-500 px-1.5 py-0.5 rounded truncate max-w-[140px]"
              title={`${field.name}: ${field.value || '-'}`}
            >
              {field.name}: {field.value || '-'}
            </span>
          ))}
        </div>
      )}

      {/* Meta indicators */}
      {(task.commentCount > 0 || task.attachmentCount > 0 || task.description) && (
        <div className="flex items-center gap-2 sm:gap-3 text-slate-400 mb-2.5 sm:mb-4 text-[10px] sm:text-xs">
          {task.description && (
            <AlignLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" title="Has description" />
          )}
          {task.commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {task.commentCount}
            </div>
          )}
          {task.attachmentCount > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {task.attachmentCount}
            </div>
          )}
        </div>
      )}

      {/* Footer: Due Date & Assignees */}
      <div className="flex items-center justify-between mt-auto pt-1.5 sm:pt-2 gap-2">
        {task.dueDate ? (
          <div
            className={cn(
              'flex items-center gap-1 text-[10px] sm:text-xs shrink-0',
              getDueDateColor(task.dueDate, task.status)
            )}
          >
            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">{formatDueDate(task.dueDate)}</span>
          </div>
        ) : (
          <div />
        )}

        {task.assignees?.length > 0 && (
          <div className="flex -space-x-1.5 sm:-space-x-2 shrink-0">
            {task.assignees.slice(0, 3).map((user) => (
              <div
                key={user._id}
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-indigo-100 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-indigo-700 hover:z-10 hover:scale-110 transition-transform cursor-pointer overflow-hidden"
                title={user.name}
              >
                {user.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-300"
                title={`+${task.assignees.length - 3} more`}
              >
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}