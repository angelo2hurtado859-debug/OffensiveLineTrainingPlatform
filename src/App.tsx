import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Playbook from './pages/Playbook';
import AppLayout from './components/AppLayout';
import Placeholder from './pages/Placeholder';

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/onboarding', element: <Onboarding /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'playbook', element: <Playbook /> },
      { path: 'training', element: <Placeholder /> },
      { path: 'quiz', element: <Placeholder /> },
      { path: 'progress', element: <Placeholder /> },
      { path: 'rankings', element: <Placeholder /> },
    ]
  },
  { path: '*', element: <Navigate to="/" replace /> }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
