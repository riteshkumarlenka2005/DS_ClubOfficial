import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for API calls
 * Usage: const { data, isLoading, error, refetch } = useApi(() => eventService.getPublished())
 */
export function useApi<T>(
  apiCall: () => Promise<{ success: boolean; data: T; message: string }>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiCall();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Something went wrong');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Network error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

