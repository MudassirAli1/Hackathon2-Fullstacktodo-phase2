import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth.types';
import { authService } from '@/services/auth-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  error: string | null;
  signup: (email: string, password: string, name?: string) => Promise<any>;
  signin: (email: string, password: string) => Promise<any>;
  signout: () => void;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      // Check if we have a token in localStorage
      const storedToken = localStorage.getItem('jwt_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          // Token is expired, clear it and update state
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        } else {
          setToken(storedToken);

          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              setIsAuthenticated(true);
            } catch (e) {
              console.error('Error parsing stored user:', e);
              // If user data is corrupted, just set token and continue
              setIsAuthenticated(true);
            }
          } else {
            setIsAuthenticated(true);
          }
        }
      }
    } catch (e) {
      console.error('Error checking auth status:', e);
      setError('Error checking authentication status');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      // Decode the token to check expiration
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(encodeURIComponent(atob(base64))));

      // Check if the token has expired
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (e) {
      console.error('Error decoding token:', e);
      return true; // If we can't decode it, treat as expired
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signup({ email, password, name });

      if (result.success && result.token) {
        // Token is already stored by the authService, but we'll update our local state
        const newToken = localStorage.getItem('jwt_token');
        if (newToken) {
          setToken(newToken);
          if (result.user) {
            setUser(result.user);
          }
          setIsAuthenticated(true);
        }

        return result;
      } else {
        setError(result.error || 'Signup failed');
        return result;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signin({ email, password });

      if (result.success && result.token) {
        // Token is already stored by the authService, but we'll update our local state
        const newToken = localStorage.getItem('jwt_token');
        if (newToken) {
          setToken(newToken);
          if (result.user) {
            setUser(result.user);
          }
          setIsAuthenticated(true);
        }

        return result;
      } else {
        setError(result.error || 'Invalid credentials');
        return result;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signout = () => {
    // Use the authService to handle signout
    authService.signout();

    // Reset local state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        token,
        error,
        signup,
        signin,
        signout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};