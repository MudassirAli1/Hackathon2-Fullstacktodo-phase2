/**
 * Utility functions for handling authentication tokens in the frontend
 */

// Function to save JWT token to localStorage
export const saveToken = (token: string): void => {
  try {
    localStorage.setItem('jwt_token', token);
  } catch (error) {
    console.error('Error saving token to localStorage:', error);
  }
};

// Function to retrieve JWT token from localStorage
export const getToken = (): string | null => {
  try {
    return localStorage.getItem('jwt_token');
  } catch (error) {
    console.error('Error retrieving token from localStorage:', error);
    return null;
  }
};

// Function to remove JWT token from localStorage
export const removeToken = (): void => {
  try {
    localStorage.removeItem('jwt_token');
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

// Function to save user information to localStorage
export const saveUser = (user: any): void => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

// Function to retrieve user information from localStorage
export const getUser = (): any => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error retrieving user from localStorage:', error);
    return null;
  }
};

// Function to remove user information from localStorage
export const removeUser = (): void => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

// Function to check if the JWT token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    // Decode the token without verifying signature to check expiration
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));

    // Check if the token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // If there's an error parsing the token, assume it's invalid
    return true;
  }
};

// Function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    // Remove expired token
    removeToken();
    removeUser();
    return false;
  }

  return true;
};

// Function to clear all authentication data from localStorage
export const clearAuthData = (): void => {
  removeToken();
  removeUser();
};