import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';

// Layouts
import { AppShell } from '../components/layout/AppShell';
import { AdminLayout } from '../components/layout/AdminLayout';

// Auth & Landing Pages
import LandingPage from '../features/landing/pages/LandingPage';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import AuthCallback from '../features/auth/pages/AuthCallback';
import ForgotPassword from '../features/auth/pages/ForgotPassword'; // ⬅️ NAYA
import ResetPassword from '../features/auth/pages/ResetPassword'; // ⬅️ NAYA

// Workspace Pages
import Dashboard from '../features/workspaces/pages/Dashboard';
import WorkspaceView from '../features/workspaces/pages/WorkspaceView';
import WorkspaceSettings from '../features/workspaces/pages/WorkspaceSettings';
import Team from '../features/workspaces/pages/Team';
import AuditLog from '../features/workspaces/pages/AuditLog';
import MessagesPage from '../features/messages/pages/MessagesPage';

// Project / Board Pages
import ProjectBoard from '../features/board/pages/ProjectBoard';

// Tasks & Settings Pages
import MyTasks from '../features/tasks/pages/MyTasks';
import Settings from '../features/settings/pages/Settings';

// Invite Page
import AcceptInvite from '../features/invites/pages/AcceptInvite';

// Admin Pages
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import AdminUsers from '../features/admin/pages/AdminUsers';
import AdminWorkspaces from '../features/admin/pages/AdminWorkspaces';
import AdminActivities from '../features/admin/pages/AdminActivities';
import AdminWorkspaceDetails from '../features/admin/pages/AdminWorkspaceDetails';
import AdminUserDetails from '../features/admin/pages/AdminUserDetails';

// --- Route Guards ---
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const PublicRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

const SuperAdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'super_admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

// --- Router Definition ---
export const router = createBrowserRouter([
  // Landing Page
  { path: '/', element: <LandingPage /> },

  // Public Routes (Login, Register, Forgot, Reset)
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/auth/callback', element: <AuthCallback /> },
      { path: '/forgot-password', element: <ForgotPassword /> },       // ⬅️ NAYA
      { path: '/reset-password/:token', element: <ResetPassword /> },  // ⬅️ NAYA
    ],
  },

  // Accept Invite (Public)
  {
    path: '/accept-invite/:token',
    element: <AcceptInvite />
  },

  // Admin Routes (Super Admin only)
  {
    element: <SuperAdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <AdminDashboard /> },
          { path: '/admin/users', element: <AdminUsers /> },
          { path: '/admin/users/:userId', element: <AdminUserDetails /> },
          { path: '/admin/workspaces', element: <AdminWorkspaces /> },
          { path: '/admin/workspaces/:workspaceId', element: <AdminWorkspaceDetails /> },
          { path: '/admin/activities', element: <AdminActivities /> },
        ]
      }
    ]
  },

  // Protected Routes (Regular users)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/workspace/:workspaceId', element: <WorkspaceView /> },
          { path: '/workspace/:workspaceId/settings', element: <WorkspaceSettings /> },
          { path: '/workspace/:workspaceId/audit', element: <AuditLog /> },
          { path: '/workspace/:workspaceId/project/:projectId/board', element: <ProjectBoard /> },
          { path: '/my-tasks', element: <MyTasks /> },
          { path: '/messages', element: <MessagesPage /> },
          { path: '/team', element: <Team /> },
          { path: '/settings', element: <Settings /> },
        ]
      }
    ],
  },

  { path: '*', element: <Navigate to="/login" replace /> },
]);