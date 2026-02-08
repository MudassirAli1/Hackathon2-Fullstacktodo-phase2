import ApiClient from './api-client';
import { Task } from '@/types/task.types';

const apiClient = new ApiClient();

export const taskService = {
  // Get all tasks for a user
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const response = await apiClient.get<{ success: boolean; tasks: Task[] }>(`/api/users/${userId}/tasks`);
      return response.data.success ? response.data.tasks || [] : [];
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  },

  // Create a new task
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<Task> {
    try {
      const response = await apiClient.post<{ success: boolean; task: Task}>(
        `/api/users/${taskData.userId}/tasks`,
        {
          title: taskData.title,
          description: taskData.description || "",
          completed: taskData.completed
        }
      );
      if (response.data.success) {
        return response.data.task;
      } else {
        throw new Error(response.data.task ? "Task creation failed" : "Unknown error");
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  },

  // Update an existing task
  async updateTask(userId: string, taskId: string, taskData: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'completedAt'>>): Promise<Task> {
    try {
      const response = await apiClient.put<{ success: boolean; task: Task}>(
        `/api/users/${userId}/tasks/${taskId}`,
        taskData
      );
      if (response.data.success) {
        return response.data.task;
      } else {
        throw new Error("Task update failed");
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  },

  // Delete a task
  async deleteTask(userId: string, taskId: string): Promise<void> {
    try {
      const response = await apiClient.delete<{ success: boolean; message?: string }>(`/api/users/${userId}/tasks/${taskId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Task deletion failed");
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  },

  // Toggle task completion status
  async toggleTaskCompletion(userId: string, taskId: string, completed: boolean): Promise<Task> {
    try {
      const response = await apiClient.patch<{ success: boolean; task: Task}>(
        `/api/users/${userId}/tasks/${taskId}/complete`,
        { completed }
      );
      if (response.data.success) {
        return response.data.task;
      } else {
        throw new Error("Task completion toggle failed");
      }
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      throw error;
    }
  }
};