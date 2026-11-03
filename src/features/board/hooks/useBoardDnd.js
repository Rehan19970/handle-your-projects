import { useState, useEffect } from 'react'; // ⬅️ useEffect add karo
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';

export function useBoardDnd({ initialTasks, workspaceId, projectId, onTasksChange }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState(null);

  // ⬇️ NAYA: InitialTasks change hone par sync karo
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex(t => t._id === activeId);
        const overIndex = prev.findIndex(t => t._id === overId);

        if (prev[activeIndex].columnId !== prev[overIndex].columnId) {
          const updated = [...prev];
          updated[activeIndex].columnId = prev[overIndex].columnId;
          return arrayMove(updated, activeIndex, overIndex);
        }

        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    if (isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex(t => t._id === activeId);
        const updated = [...prev];
        updated[activeIndex].columnId = overId;
        return updated;
      });
    }
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const task = tasks.find(t => t._id === activeId);
    if (!task) return;

    onTasksChange(tasks);

    try {
      await api.patch(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${activeId}/move`, {
        columnId: task.columnId,
      });
    } catch (error) {
      toast.error('Failed to move task');
    }
  };

  return {
    tasks,
    setTasks,
    activeTask,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    DndContext,
    DragOverlay,
    closestCorners,
  };
}