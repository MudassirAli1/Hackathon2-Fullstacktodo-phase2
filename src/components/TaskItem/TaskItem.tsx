import React, { useState } from 'react';
import { Task } from '@/types/task.types';
import { taskService } from '@/services/task-service';

interface TaskItemProps {
  task: Task;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onTaskUpdate, onTaskDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

  const handleToggleComplete = async () => {
    try {
      // Get user ID from localStorage (in a real app, get from auth context)
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.error('No JWT token found');
        return;
      }

      // We need to extract userId from the token, but for now we'll use a mock approach
      // The correct way would be to have the user ID available through auth context
      // For the purpose of this implementation, we'll assume it's available in the task
      const updatedTask = await taskService.toggleTaskCompletion(task.userId, task.id, !task.completed);
      onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updatedTask = await taskService.updateTask(task.userId, task.id, {
        title: editedTitle,
        description: editedDescription,
        completed: task.completed
      });
      onTaskUpdate(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(task.userId, task.id);
        onTaskDelete(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  return (
    <li className={`py-4 ${task.completed ? 'bg-green-50' : 'bg-white'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        />

        <div className="min-w-0 flex-1 w-full">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Task title"
                autoFocus
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Task description (optional)"
                rows={2}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-w-[80px]"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-w-[80px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
              <div className="flex-1 min-w-0">
                <p className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-900'} text-base font-medium`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-end mt-2 sm:mt-0">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-w-[70px] transition-colors duration-200"
                  aria-label="Edit task"
                >
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-w-[70px] transition-colors duration-200"
                  aria-label="Delete task"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}