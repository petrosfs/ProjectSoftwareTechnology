import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Marketplace } from './components/Marketplace';
import { Profile } from './components/Profile';
import { Sessions } from './components/Sessions';
import { Messages } from './components/Messages';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './context/AuthContext';

function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-purple-400 text-lg font-medium">Φόρτωση...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    Component: AuthGuard,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: 'marketplace', Component: Marketplace },
          { path: 'profile', Component: Profile },
          { path: 'sessions', Component: Sessions },
          { path: 'messages', Component: Messages },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
]);
