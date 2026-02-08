'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header/Header';
import TaskList from '@/components/TaskList/TaskList';
import TaskForm from '@/components/TaskForm/TaskForm';
import { Task } from '@/types/task.types';
import { taskService } from '@/services/task-service';

export default function DashboardPage() {
  const { authState, checkAuthStatus } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Check authentication status on component mount
    checkAuthStatus();

    // If user is not authenticated, redirect to auth page
    if (!authState.isAuthenticated && !authState.isLoading) {
      router.push('/');
    }

    // Load tasks if authenticated
    if (authState.isAuthenticated && authState.user?.id) {
      loadTasks();
    }
  }, [authState, checkAuthStatus, router]);

  const loadTasks = async () => {
    if (!authState.user?.id) return;

    try {
      setLoading(true);
      const userTasks = await taskService.getTasks(authState.user.id);
      setTasks(userTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    setShowForm(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleTaskDeleted = (deletedTaskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== deletedTaskId));
  };

  // Show loading state while checking auth
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, don't render the dashboard content
  if (!authState.isAuthenticated) {
    return null; // The redirect happens in the effect above
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Tasks</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showForm ? 'Cancel' : '+ Add Task'}
            </button>
          </div>

          {showForm && authState.user?.id && (
            <TaskForm
              userId={authState.user.id}
              onTaskCreated={handleTaskCreated}
              onCancel={() => setShowForm(false)}
            />
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              onTaskUpdate={handleTaskUpdated}
              onTaskDelete={handleTaskDeleted}
            />
          </div>
        </div>
      </main>
    </div>
  );
}