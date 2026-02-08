import { saveToken, saveUser, clearAuthData, getToken } from '@/utils/auth';
import { SignUpCredentials, SignInCredentials, AuthResponse } from '@/types/auth.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Service for handling authentication requests to the backend API
 */
export const authService = {
  /**
   * Register a new user account
   */
  async signup(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        // Save token and user info
        saveToken(data.token);
        if (data.user) {
          saveUser(data.user);
        }

        return {
          success: true,
          token: data.token,
          user: data.user,
        };
      } else {
        return {
          success: false,
          error: data.error || 'Signup failed',
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },

  /**
   * Authenticate an existing user
   */
  async signin(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        // Save token and user info
        saveToken(data.token);
        if (data.user) {
          saveUser(data.user);
        }

        return {
          success: true,
          token: data.token,
          user: data.user,
        };
      } else {
        return {
          success: false,
          error: data.error || 'Invalid credentials',
        };
      }
    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  },

  /**
   * Logout the current user
   */
  async signout(): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the current token
      const token = getToken();

      // Call the logout endpoint if we have a token
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Clear local storage
      clearAuthData();

      return { success: true };
    } catch (error) {
      // Even if the API call fails, we should clear the local data
      clearAuthData();
      console.error('Signout error:', error);

      return {
        success: true,
        error: error instanceof Error ? error.message : 'Error during logout',
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // This uses the utility function that checks token validity
    return !!getToken(); // For simplicity, just check if token exists
    // In a more complete implementation, we would also check if the token is not expired
  },
};