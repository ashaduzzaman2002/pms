import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiService from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'staff' | 'guest';
  avatar?: string;
  permissions?: string[];
}

interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  error: string | null;
  permissions: string[];
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearError: () => void;
  
  // Computed properties
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isGuest: boolean;
  isStaff: boolean;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canAccess: (resource: string, action?: string) => boolean;
  
  // User info
  userName: string;
  userEmail: string;
  userAvatar: string;
  userId: string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          apiService.setToken(token);
          const data = await apiService.getCurrentUser();
          setUser(data.user);
          setPermissions(data.user.permissions || []);
        } catch (error: any) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          apiService.clearToken();
          setError('Session expired. Please login again.');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Listen for auth events
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setPermissions([]);
      setError('Session expired. Please login again.');
    };

    const handleNetworkError = (event: CustomEvent) => {
      setError('Network error. Please check your connection.');
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    window.addEventListener('network:error', handleNetworkError as EventListener);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
      window.removeEventListener('network:error', handleNetworkError as EventListener);
    };
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.login(email, password);
      setUser(data.user);
      setPermissions(data.user.permissions || []);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      return data;
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.register(userData);
      setUser(data.user);
      setPermissions(data.user.permissions || []);
      
      return data;
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setPermissions([]);
      setError(null);
      localStorage.removeItem('rememberMe');
      apiService.closeWebSocket();
    }
  }, []);

  const updateUser = useCallback(async (userData: any): Promise<User> => {
    try {
      const updatedUser = await apiService.updateUser(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await apiService.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      setError(error.message || 'Failed to change password');
      throw error;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await apiService.forgotPassword(email);
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      await apiService.resetPassword(token, password);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Permission helpers
  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.includes(permission) || user?.role === 'admin';
  }, [permissions, user]);

  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return roles.includes(user?.role || '');
  }, [user]);

  const canAccess = useCallback((resource: string, action = 'read'): boolean => {
    if (user?.role === 'admin') return true;
    
    const permission = `${resource}:${action}`;
    return permissions.includes(permission);
  }, [permissions, user]);

  // Setup WebSocket connection for authenticated users
  useEffect(() => {
    if (user && user.id) {
      apiService.setupWebSocket(user.id);
    }

    return () => {
      apiService.closeWebSocket();
    };
  }, [user]);

  const value: AuthContextType = {
    // State
    user,
    loading,
    error,
    permissions,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    
    // Computed properties
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOwner: user?.role === 'owner',
    isGuest: user?.role === 'guest',
    isStaff: user?.role === 'staff',
    
    // Permission helpers
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess,
    
    // User info
    userName: user?.name || '',
    userEmail: user?.email || '',
    userAvatar: user?.avatar || '',
    userId: user?.id || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
