import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Search, Plus, SlidersHorizontal, X, UserPlus } from 'lucide-react'; // ⬅️ UserPlus add karo
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSocket } from '../../../app/providers/SocketProvider';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { useBoardDnd } from '../hooks/useBoardDnd';
import { BoardColumn } from '../components/BoardColumn';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../../tasks/components/TaskModal';
import { InviteModal } from '../../workspaces/components/InviteModal'; // ⬅️ NAYA
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';

export default function ProjectBoard() {
  const { workspaceId, projectId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { activeWorkspace } = useWorkspaceStore();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false); // ⬅️ NAYA

  const [tasksData, setTasksData] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Load function (reusable)
  const loadData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/workspaces/${workspaceId}/projects/${projectId}`),
        api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks`)
      ]);
      setProject(projRes.data);
      setTasksData(tasksRes.data);
    } catch (error) {
      toast.error('Failed to load board');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspaceId, projectId]);

  const {
    tasks, setTasks, activeTask, sensors,
    handleDragStart, handleDragOver, handleDragEnd,
    DndContext, DragOverlay, closestCorners
  } = useBoardDnd({
    initialTasks: tasksData,
    workspaceId,
    projectId,
    onTasksChange: () => { }
  });

  // ⬇️ LIVE SOCKET UPDATES
  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit('project:join', projectId);
    console.log('🔌 Joined project room:', projectId);

    const handleTaskCreated = (data) => {
      console.log('📥 TASK_CREATED:', data);
      if (data.projectId !== projectId) return;

      setTasksData(prev => {
        if (prev.find(t => t._id === data.task._id)) return prev;
        return [...prev, data.task];
      });

      setTasks(prev => {
        if (prev.find(t => t._id === data.task._id)) return prev;
        return [...prev, data.task];
      });
    };

    const handleTaskUpdated = (data) => {
      console.log('📥 TASK_UPDATED:', data);
      if (data.projectId !== projectId) return;

      setTasksData(prev => prev.map(t =>
        t._id === data.task._id ? { ...t, ...data.task } : t
      ));

      setTasks(prev => prev.map(t =>
        t._id === data.task._id ? { ...t, ...data.task } : t
      ));
    };

    const handleTaskMoved = (data) => {
      console.log('📥 TASK_MOVED:', data);
      if (data.projectId !== projectId) return;

      setTasksData(prev => prev.map(t =>
        t._id === data.taskId
          ? { ...t, columnId: data.columnId, status: data.columnId, order: data.order }
          : t
      ));

      setTasks(prev => prev.map(t =>
        t._id === data.taskId
          ? { ...t, columnId: data.columnId, status: data.columnId, order: data.order }
          : t
      ));
    };

    const handleTaskDeleted = (data) => {
      console.log('📥 TASK_DELETED:', data);
      if (data.projectId !== projectId) return;

      setTasksData(prev => prev.filter(t => t._id !== data.taskId));
      setTasks(prev => prev.filter(t => t._id !== data.taskId));
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.emit('project:leave', projectId);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket, projectId, setTasks]);

  // Filtering Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === 'all' ? true : task.priority === priorityFilter;
      const matchesMyTasks = myTasksOnly ? task.assignees?.some(a => a._id === user._id) : true;
      return matchesSearch && matchesPriority && matchesMyTasks;
    });
  }, [tasks, search, priorityFilter, myTasksOnly, user]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!project) return <div className="p-10">Project not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
        <div className="flex items-center gap-4">
          <Link to={`/workspace/${workspaceId}`} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs px-2 py-1 rounded-md font-medium">
                {project.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search tasks..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button
            variant={showFilters ? "primary" : "outline"}
            size="sm"
            className="h-9"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
          </Button>
          
          {/* ⬇️ NAYA: Add Member Button */}
          <Button 
            size="sm" 
            variant="outline"
            className="h-9" 
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" /> Add Member
          </Button>
          
          <Button size="sm" className="h-9" onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Priority:</span>
            {['all', 'urgent', 'high', 'medium', 'low'].map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={cn(
                  "text-xs px-2 py-1 rounded-md capitalize transition-colors",
                  priorityFilter === p
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 font-semibold"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={myTasksOnly}
              onChange={(e) => setMyTasksOnly(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Only my tasks
          </label>

          {(search || priorityFilter !== 'all' || myTasksOnly) && (
            <button
              onClick={() => { setSearch(''); setPriorityFilter('all'); setMyTasksOnly(false); }}
              className="ml-auto text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full items-start pb-4">
            {project.columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={filteredTasks.filter((t) => t.columnId === column.id)}
                onAddTask={() => {
                  setSelectedTask({ columnId: column.id });
                  setIsModalOpen(true);
                }}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        workspaceId={workspaceId}
        projectId={projectId}
        columns={project.columns}
        workspaceMembers={activeWorkspace?.members || []}
        onTaskSaved={(newTask) => {
          setTasksData(prev => {
            const exists = prev.find(t => t._id === newTask._id);
            if (exists) return prev.map(t => t._id === newTask._id ? newTask : t);
            return [...prev, newTask];
          });
          setTasks(prev => {
            const exists = prev.find(t => t._id === newTask._id);
            if (exists) return prev.map(t => t._id === newTask._id ? newTask : t);
            return [...prev, newTask];
          });
        }}
      />

      {/* ⬇️ NAYA: InviteModal for adding project members */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspaceId}
        projectId={projectId}
        onInviteSent={() => {
          loadData(); // Refresh project to show new member
        }}
      />
    </div>
  );
}