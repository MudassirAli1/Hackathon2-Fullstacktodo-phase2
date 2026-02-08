export interface User {
  id: string
  email: string
  name?: string
  createdAt?: string
  isAuthenticated: boolean
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  jwtToken: string | null
  error: string | null
}

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
  completedAt?: string | null
}

export interface TaskFilter {
  status: 'all' | 'active' | 'completed'
  searchTerm: string
}

export interface ApiRequestState {
  isLoading: boolean
  error: string | null
  success: boolean
}