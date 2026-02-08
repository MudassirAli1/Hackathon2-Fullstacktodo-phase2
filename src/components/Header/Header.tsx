'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { authState, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-0 gap-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Todo App</h1>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto">
            {authState.user ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <span className="text-sm text-gray-700 text-center sm:text-left">
                  Welcome, {authState.user.name || authState.user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/')}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}