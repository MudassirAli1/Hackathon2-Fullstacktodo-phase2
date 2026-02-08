'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthState } from '@/types/task.types'
import { AuthResponse, SignUpCredentials, SignInCredentials } from '@/types/auth.types'
import { authService } from '@/services/auth-service'

interface AuthContextType {
  authState: AuthState
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse>
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse>
  signOut: () => Promise<void>
  checkAuthStatus: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    jwtToken: null,
    error: null,
  })

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()

    // Set up token expiration check interval (check every minute)
    const interval = setInterval(() => {
      if (authState.isAuthenticated && authService.isTokenExpired()) {
        // Token has expired, automatically log out the user
        handleTokenExpiration();
      }
    }, 60000); // Check every minute

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [authState.isAuthenticated])

  const handleTokenExpiration = () => {
    // Token expired, clear token and update state
    authService.clearToken();

    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      jwtToken: null,
      error: 'Session expired. Please log in again.',
    });
  }

  const checkAuthStatus = () => {
    // Check if user is authenticated using enhanced auth service
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      const token = localStorage.getItem('jwt_token');

      setAuthState({
        user: user,
        isLoading: false,
        isAuthenticated: true,
        jwtToken: token,
        error: null,
      });
    } else {
      // Token is expired or doesn't exist
      if (localStorage.getItem('jwt_token')) {
        // Token exists but is expired, remove it
        authService.clearToken();
      }

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        jwtToken: null,
        error: null,
      });
    }
  }

  const signUp = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await authService.signUp(credentials);

      if (result.success) {
        // Get updated user info after successful sign up
        const user = authService.getCurrentUser();
        const token = localStorage.getItem('jwt_token');

        setAuthState({
          user: user,
          isLoading: false,
          isAuthenticated: true,
          jwtToken: token,
          error: null,
        });

        return result;
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Signup failed',
        }));

        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }

  const signIn = async (credentials: SignInCredentials): Promise<AuthResponse> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await authService.signIn(credentials);

      if (result.success) {
        // Get updated user info after successful sign in
        const user = authService.getCurrentUser();
        const token = localStorage.getItem('jwt_token');

        setAuthState({
          user: user,
          isLoading: false,
          isAuthenticated: true,
          jwtToken: token,
          error: null,
        });

        return result;
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Signin failed',
        }));

        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        jwtToken: null,
        error: null,
      });
    } catch (error) {
      // Even if the API call fails, clear local state
      authService.clearToken();

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        jwtToken: null,
        error: null,
      });
    }
  }

  return (
    <AuthContext.Provider value={{ authState, signUp, signIn, signOut, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  )
}