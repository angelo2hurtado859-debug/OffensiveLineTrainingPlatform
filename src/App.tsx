import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Playbook from './pages/Playbook';
import Training from './pages/Training';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import Rankings from './pages/Rankings';
import AvatarStudio from './pages/AvatarStudio';
import About from './pages/About';
import Profile from './pages/Profile';
import AppLayout from './components/AppLayout';

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/onboarding', element: <Onboarding /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'playbook', element: <Playbook /> },
      { path: 'training', element: <Training /> },
      { path: 'quiz', element: <Quiz /> },
      { path: 'progress', element: <Progress /> },
      { path: 'rankings', element: <Rankings /> },
      { path: 'profile', element: <Profile /> },
      { path: 'avatar', element: <AvatarStudio /> },
      { path: 'about', element: <About /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
