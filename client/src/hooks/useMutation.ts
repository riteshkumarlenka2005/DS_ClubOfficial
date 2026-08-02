import { useState, useCallback } from 'react';

interface UseMutationState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  mutate: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Generic hook for mutations (POST, PUT, PATCH, DELETE)
 * Usage: const { mutate, isLoading } = useMutation(eventService.create)
 */
export function useMutation<T>(
  mutationFn: (...args: any[]) => Promise<{ success: boolean; data: T; message: string }>
): UseMutationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await mutationFn(...args);
        if (response.success) {
          setData(response.data);
          return response.data;
        } else {
          setError(response.message);
          return null;
        }
      } catch (err: any) {
        const message =
          err.response?.data?.message || err.message || 'Operation failed';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, mutate, reset };
}

