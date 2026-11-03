import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { TaskCardSkeleton } from '../../../components/ui/Skeleton';
import { cn } from '../../../lib/utils';

export function BoardColumn({ column, tasks, onAddTask, onTaskClick, isLoading }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'Column', columnId: column.id },
  });

  return (
    <div className="flex flex-col w-[85vw] sm:w-80 max-w-80 shrink-0 h-full max-h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3 px-1">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm tracking-wide truncate">
            {column.name}
          </h3>
          <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2 rounded-full font-medium shrink-0">
            {isLoading ? '...' : tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 text-slate-400 shrink-0">
          <button
            onClick={onAddTask}
            className="p-1.5 sm:p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
            title="Add Task"
            aria-label="Add task"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 sm:p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
            aria-label="Column options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Drop Area & Task List */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto min-h-[140px] sm:min-h-[150px] rounded-xl transition-colors p-1.5 sm:p-2 -mx-1.5 sm:-mx-2',
          'touch-pan-y', // touch scroll ke saath drag ko handle karta hai
          isOver ? 'bg-slate-100/50 dark:bg-slate-800/50' : 'bg-transparent'
        )}
      >
        {isLoading ? (
          <div className="flex flex-col gap-2.5 sm:gap-3 pb-3 sm:pb-4">
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </div>
        ) : (
          <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2.5 sm:gap-3 pb-3 sm:pb-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg px-2">
                  Drop tasks here
                </div>
              )}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}