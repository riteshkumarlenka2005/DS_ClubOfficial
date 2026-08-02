import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type UserRole = 'student' | 'member' | 'admin';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location, showLogin: true }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
          <p className="text-xl text-gray-600 mb-2">Access Denied</p>
          <p className="text-gray-500">
            You don't have permission to view this page.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Required role: {allowedRoles.join(' or ')} | Your role:{' '}
            {user.role}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

