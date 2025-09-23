import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: (string | { resource: string; action: string })[];
  fallbackPath?: string;
  unauthorizedPath?: string;
}

interface PermissionGateProps {
  children: ReactNode;
  roles?: string[];
  permissions?: (string | { resource: string; action: string })[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallbackPath = '/login',
  unauthorizedPath = '/unauthorized'
}: ProtectedRouteProps) => {
  const { 
    isAuthenticated, 
    loading, 
    hasRole, 
    hasAnyRole, 
    hasPermission, 
    canAccess 
  } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.length === 1 
      ? hasRole(requiredRoles[0])
      : hasAnyRole(requiredRoles);
    
    if (!hasRequiredRole) {
      return <Navigate to={unauthorizedPath} replace />;
    }
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => {
      if (typeof permission === 'string') {
        return hasPermission(permission);
      }
      
      if (typeof permission === 'object') {
        const { resource, action } = permission;
        return canAccess(resource, action);
      }
      
      return false;
    });
    
    if (!hasRequiredPermissions) {
      return <Navigate to={unauthorizedPath} replace />;
    }
  }

  return <>{children}</>;
};

// Higher-order component for protecting routes
export const withAuth = (Component: React.ComponentType<any>, options: Omit<ProtectedRouteProps, 'children'> = {}) => {
  return (props: any) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific route protection components
export const AdminRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) => (
  <ProtectedRoute requiredRoles={['admin']} {...props}>
    {children}
  </ProtectedRoute>
);

export const OwnerRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) => (
  <ProtectedRoute requiredRoles={['admin', 'owner']} {...props}>
    {children}
  </ProtectedRoute>
);

export const StaffRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) => (
  <ProtectedRoute requiredRoles={['admin', 'staff']} {...props}>
    {children}
  </ProtectedRoute>
);

export const GuestRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth'>) => (
  <ProtectedRoute requireAuth={false} {...props}>
    {children}
  </ProtectedRoute>
);

// Component for conditional rendering based on permissions
export const PermissionGate = ({ 
  children, 
  roles = [], 
  permissions = [], 
  fallback = null,
  requireAll = false 
}: PermissionGateProps) => {
  const { hasRole, hasAnyRole, hasPermission, canAccess } = useAuth();

  // Check roles
  if (roles.length > 0) {
    const hasRequiredRole = requireAll 
      ? roles.every(role => hasRole(role))
      : hasAnyRole(roles);
    
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Check permissions
  if (permissions.length > 0) {
    const checkPermission = (permission: string | { resource: string; action: string }) => {
      if (typeof permission === 'string') {
        return hasPermission(permission);
      }
      
      if (typeof permission === 'object') {
        const { resource, action } = permission;
        return canAccess(resource, action);
      }
      
      return false;
    };

    const hasRequiredPermissions = requireAll
      ? permissions.every(checkPermission)
      : permissions.some(checkPermission);
    
    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
