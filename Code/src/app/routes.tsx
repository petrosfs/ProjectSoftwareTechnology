import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Marketplace } from './components/Marketplace';
import { Profile } from './components/Profile';
import { Sessions } from './components/Sessions';
import { Messages } from './components/Messages';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'marketplace', Component: Marketplace },
      { path: 'profile', Component: Profile },
      { path: 'sessions', Component: Sessions },
      { path: 'messages', Component: Messages },
      {
        path: '*',
        Component: () => (
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600">The page you're looking for doesn't exist.</p>
          </div>
        ),
      },
    ],
  },
]);
