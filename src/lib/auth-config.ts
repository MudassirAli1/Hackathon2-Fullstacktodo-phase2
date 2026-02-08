// Better Auth client-side configuration
// This file would contain the client-side setup for interacting with the Better Auth API

export interface AuthConfig {
  baseURL: string;
  headers: {
    'Content-Type': string;
  };
}

export const authConfig: AuthConfig = {
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
};

export default authConfig;