import { betterAuth } from 'better-auth';

// Initialize Better Auth client with frontend configuration
const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:8000',
  fetchOptions: {
    baseUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:8000',
  }
});

export default auth;