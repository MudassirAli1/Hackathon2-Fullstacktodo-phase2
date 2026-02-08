/**
 * Error handling utilities for authentication and API operations
 */

// Standardized error responses for authentication
export interface AuthErrorResponse {
  success: boolean;
  error: string;
  code?: string;
}

// Standardized success responses for authentication
export interface AuthSuccessResponse<T = any> {
  success: boolean;
  data?: T;
  token?: string;
  message?: string;
}

// Union type for authentication responses
export type AuthResponse<T = any> = AuthErrorResponse | AuthSuccessResponse<T>;

/**
 * Creates a standardized authentication error response
 */
export function createAuthError(error: string, code?: string): AuthErrorResponse {
  return {
    success: false,
    error,
    code
  };
}

/**
 * Creates a standardized authentication success response
 */
export function createAuthSuccess<T>(data?: T, token?: string, message?: string): AuthSuccessResponse<T> {
  return {
    success: true,
    ...(data && { data }),
    ...(token && { token }),
    ...(message && { message })
  };
}

/**
 * Handles authentication errors in a consistent way
 */
export function handleAuthError(error: any): AuthErrorResponse {
  // Check if it's a network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createAuthError('Network error: Unable to connect to authentication server', 'NETWORK_ERROR');
  }

  // Check if it's a specific authentication error
  if (error?.status === 401) {
    return createAuthError('Unauthorized: Invalid credentials', 'UNAUTHORIZED');
  }

  if (error?.status === 403) {
    return createAuthError('Forbidden: Access denied', 'FORBIDDEN');
  }

  if (error?.status === 422) {
    return createAuthError('Validation error: Invalid input data', 'VALIDATION_ERROR');
  }

  if (error?.status === 500) {
    return createAuthError('Server error: Please try again later', 'SERVER_ERROR');
  }

  // Handle token-specific errors
  if (typeof error === 'string') {
    if (error.toLowerCase().includes('token')) {
      if (error.toLowerCase().includes('expired')) {
        return createAuthError('Session expired: Please sign in again', 'TOKEN_EXPIRED');
      } else if (error.toLowerCase().includes('invalid')) {
        return createAuthError('Invalid session: Please sign in again', 'INVALID_TOKEN');
      }
    }

    // Generic error message if it's just a string
    return createAuthError(error);
  }

  // Handle error objects
  if (error && typeof error === 'object') {
    if (error.message) {
      return createAuthError(error.message);
    }
    if (error.detail) {
      return createAuthError(error.detail);
    }
  }

  // Default error if nothing matches
  return createAuthError('An unknown error occurred during authentication', 'UNKNOWN_ERROR');
}

/**
 * Masks sensitive information in error messages for security
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove potential tokens from error messages
  const tokenRegex = /[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;
  let sanitized = message.replace(tokenRegex, '[REDACTED_TOKEN]');

  // Remove potential passwords from error messages
  const passwordRegex = /(password|pwd|pass)['"]?\s*[:=]\s*['"]?[^'"\s,}]+['"]?/gi;
  sanitized = sanitized.replace(passwordRegex, '$1: [REDACTED]');

  // Remove potential emails if they appear in error contexts
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  sanitized = sanitized.replace(emailRegex, '[REDACTED_EMAIL]');

  return sanitized;
}

/**
 * Logs errors securely without exposing sensitive information
 */
export function logSecureError(context: string, error: any, userId?: string): void {
  // Create a sanitized error object for logging
  const logEntry = {
    context,
    timestamp: new Date().toISOString(),
    ...(userId && { userId }),
    errorType: error?.constructor?.name || typeof error,
    message: sanitizeErrorMessage(error?.message || String(error)),
    stack: error?.stack ? 'STACK_TRACE_REDACTED' : undefined,
  };

  // Log the error
  console.error('SECURE_LOG:', logEntry);
}

/**
 * Formats user-friendly error messages
 * These should be suitable for displaying to users without exposing internal details
 */
export function formatUserFriendlyMessage(errorMessage: string): string {
  const lowerError = errorMessage.toLowerCase();

  if (lowerError.includes('network') || lowerError.includes('connection')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  if (lowerError.includes('token') && lowerError.includes('expired')) {
    return 'Your session has expired. Please sign in again.';
  }

  if (lowerError.includes('unauthorized') || lowerError.includes('401')) {
    return 'Authentication required. Please sign in to continue.';
  }

  if (lowerError.includes('forbidden') || lowerError.includes('403')) {
    return 'You do not have permission to perform this action.';
  }

  if (lowerError.includes('validation') || lowerError.includes('422')) {
    return 'The information provided is not valid. Please check your input and try again.';
  }

  if (lowerError.includes('duplicate') || lowerError.includes('exists')) {
    return 'An account with this information already exists.';
  }

  if (lowerError.includes('server') || lowerError.includes('500')) {
    return 'We encountered a server error. Please try again later.';
  }

  // Default user-friendly message for any other errors
  return 'Something went wrong. Please try again or contact support if the problem persists.';
}

/**
 * Error boundary pattern for React components (to be used with React error boundaries)
 */
export class AuthErrorBoundary extends Error {
  public context: string;
  public originalError: any;

  constructor(message: string, context: string = 'Authentication', originalError?: any) {
    super(sanitizeErrorMessage(message));
    this.context = context;
    this.originalError = originalError;
    this.name = 'AuthErrorBoundary';
  }

  public getSecureLogDetails(): object {
    return {
      context: this.context,
      timestamp: new Date().toISOString(),
      message: this.message,
      errorType: this.originalError?.constructor?.name || typeof this.originalError,
    };
  }
}