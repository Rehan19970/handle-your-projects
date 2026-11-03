import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from 'date-fns';

export const formatDueDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
};

export const getDueDateColor = (dateString, status) => {
  if (!dateString || status === 'done') return 'text-slate-500';
  const date = new Date(dateString);
  
  if (isPast(date)) return 'text-red-500 font-medium'; // Overdue
  if (isToday(date)) return 'text-amber-500 font-medium'; // Due today
  return 'text-slate-500';
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};