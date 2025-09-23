import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  type: NotificationType;
  title?: string;
  message: string;
  duration: number;
  persistent: boolean;
}

interface NotificationOptions {
  title?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => number;
  removeNotification: (id: number) => void;
  clearAll: () => void;
  success: (message: string, options?: NotificationOptions) => number;
  error: (message: string, options?: NotificationOptions) => number;
  warning: (message: string, options?: NotificationOptions) => number;
  info: (message: string, options?: NotificationOptions) => number;
}

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: number) => void;
}

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: number) => void;
  position: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const { id, type, title, message, duration, persistent } = notification;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  const Icon = icons[type] || Info;

  React.useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, persistent, onRemove]);

  return (
    <div
      className={cn(
        'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
        'transform transition-all duration-300 ease-in-out',
        'hover:scale-105'
      )}
    >
      <div className={cn('p-4 border-l-4', colors[type])}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', iconColors[type])} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {title && (
              <p className="text-sm font-medium text-gray-900">{title}</p>
            )}
            <p className={cn('text-sm', title ? 'mt-1 text-gray-500' : 'text-gray-900')}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => onRemove(id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove, position }) => {
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2',
  };

  if (notifications.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-50 p-6 pointer-events-none',
        positionClasses[position as keyof typeof positionClasses] || positionClasses['top-right']
      )}
    >
      <div className="flex flex-col space-y-4">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  maxNotifications = 5,
  defaultDuration = 5000,
  position = 'top-right'
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>): number => {
    const id = Date.now() + Math.random();
    const newNotification: Notification = {
      id,
      duration: defaultDuration,
      persistent: false,
      ...notification,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    return id;
  }, [maxNotifications, defaultDuration]);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((message: string, options: NotificationOptions = {}): number => {
    return addNotification({
      type: 'success',
      message,
      duration: defaultDuration,
      persistent: false,
      ...options,
    });
  }, [addNotification, defaultDuration]);

  const error = useCallback((message: string, options: NotificationOptions = {}): number => {
    return addNotification({
      type: 'error',
      message,
      persistent: true, // Errors should be persistent by default
      duration: defaultDuration,
      ...options,
    });
  }, [addNotification, defaultDuration]);

  const warning = useCallback((message: string, options: NotificationOptions = {}): number => {
    return addNotification({
      type: 'warning',
      message,
      duration: defaultDuration,
      persistent: false,
      ...options,
    });
  }, [addNotification, defaultDuration]);

  const info = useCallback((message: string, options: NotificationOptions = {}): number => {
    return addNotification({
      type: 'info',
      message,
      duration: defaultDuration,
      persistent: false,
      ...options,
    });
  }, [addNotification, defaultDuration]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
        position={position}
      />
    </NotificationContext.Provider>
  );
};

// Hook for API error handling with notifications
export const useApiNotifications = () => {
  const { success, error, warning } = useNotification();

  const handleApiSuccess = useCallback((message: string, data?: any) => {
    success(message || 'Operation completed successfully');
  }, [success]);

  const handleApiError = useCallback((err: any, customMessage?: string) => {
    const message = customMessage || err.message || 'An error occurred';
    error(message, {
      title: `Error ${err.status ? `(${err.status})` : ''}`,
    });
  }, [error]);

  const handleApiWarning = useCallback((message: string) => {
    warning(message);
  }, [warning]);

  return {
    handleApiSuccess,
    handleApiError,
    handleApiWarning,
  };
};
