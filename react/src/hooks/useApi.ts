import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  transform?: (data: any) => any;
  cache?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | undefined>;
  reset: () => void;
  refetch: () => Promise<T | undefined>;
}

interface UseMutationOptions {
  onSuccess?: (data: any, variables: any) => void;
  onError?: (error: Error, variables: any) => void;
  onSettled?: (data: any, error: Error | null) => void;
  invalidateQueries?: string[];
}

interface UseMutationReturn<T, V> {
  mutate: (variables: V) => Promise<T>;
  loading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}

// Custom hook for API calls
export const useApi = <T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  dependencies: any[] = [],
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    immediate = true,
    onSuccess,
    onError,
    transform,
    retryAttempts = 0,
    retryDelay = 1000,
  } = options;

  const execute = useCallback(async (...args: any[]): Promise<T | undefined> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    let attempt = 0;
    while (attempt <= retryAttempts) {
      try {
        const result = await apiCall(...args);
        
        if (!mountedRef.current) return;

        const finalData = transform ? transform(result) : result;
        setData(finalData);
        
        if (onSuccess) {
          onSuccess(finalData);
        }
        
        return finalData;
      } catch (err) {
        const error = err as Error;
        if (error.name === 'AbortError') {
          return;
        }

        attempt++;
        
        if (attempt > retryAttempts) {
          if (!mountedRef.current) return;
          
          setError(error);
          
          if (onError) {
            onError(error);
          }
          
          throw error;
        } else {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }
  }, [apiCall, onSuccess, onError, transform, retryAttempts, retryDelay]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    refetch,
  };
};

// Hook for form submissions
export const useApiMutation = <T = any, V = any>(
  apiCall: (variables: V) => Promise<T>,
  options: UseMutationOptions = {}
): UseMutationReturn<T, V> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const {
    onSuccess,
    onError,
    onSettled,
    invalidateQueries = [],
  } = options;

  const mutate = useCallback(async (variables: V): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(variables);
      setData(result);
      
      // Invalidate related queries
      invalidateQueries.forEach(queryKey => {
        apiService.clearCache(queryKey);
      });
      
      if (onSuccess) {
        onSuccess(result, variables);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (onError) {
        onError(error, variables);
      }
      
      throw error;
    } finally {
      setLoading(false);
      
      if (onSettled) {
        onSettled(data, error);
      }
    }
  }, [apiCall, onSuccess, onError, onSettled, invalidateQueries, data, error]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
};

// Specific hooks for common API calls
export const useProperties = (filters: Record<string, any> = {}, options: UseApiOptions = {}) => {
  return useApi(
    () => apiService.getProperties(filters),
    [JSON.stringify(filters)],
    options
  );
};

export const useProperty = (id: string, options: UseApiOptions = {}) => {
  return useApi(
    () => apiService.getProperty(id),
    [id],
    { ...options, immediate: !!id }
  );
};

export const useBookings = (filters: Record<string, any> = {}, options: UseApiOptions = {}) => {
  return useApi(
    () => apiService.getBookings(filters),
    [JSON.stringify(filters)],
    options
  );
};

// Mutation hooks
export const useCreateProperty = (options: UseMutationOptions = {}) => {
  return useApiMutation(
    (data: any) => apiService.createProperty(data),
    {
      ...options,
      invalidateQueries: ['properties'],
    }
  );
};

export const useUpdateProperty = (options: UseMutationOptions = {}) => {
  return useApiMutation(
    ({ id, ...data }: { id: string; [key: string]: any }) => apiService.updateProperty(id, data),
    {
      ...options,
      invalidateQueries: ['properties', 'property'],
    }
  );
};

export const useDeleteProperty = (options: UseMutationOptions = {}) => {
  return useApiMutation(
    (id: string) => apiService.deleteProperty(id),
    {
      ...options,
      invalidateQueries: ['properties'],
    }
  );
};

export const useCreateBooking = (options: UseMutationOptions = {}) => {
  return useApiMutation(
    (data: any) => apiService.createBooking(data),
    {
      ...options,
      invalidateQueries: ['bookings'],
    }
  );
};

export const useUpdateBookingStatus = (options: UseMutationOptions = {}) => {
  return useApiMutation(
    ({ id, status }: { id: string; status: string }) => apiService.updateBookingStatus(id, status),
    {
      ...options,
      invalidateQueries: ['bookings'],
    }
  );
};
