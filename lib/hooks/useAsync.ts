import { useState, useCallback, useEffect } from 'react';

export interface AsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retries?: number;
  retryDelay?: number;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = options.retries ?? 3;
  const retryDelay = options.retryDelay ?? 1000;

  const execute = useCallback(async () => {
    setState({ status: 'pending', data: null, error: null });

    try {
      const result = await asyncFunction();
      setState({
        status: 'success',
        data: result,
        error: null,
      });
      options.onSuccess?.(result);
      setRetryCount(0);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Retry logic for network errors
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, retryDelay * (retryCount + 1)); // Exponential backoff
      } else {
        setState({
          status: 'error',
          data: null,
          error: err,
        });
        options.onError?.(err);
      }
    }
  }, [asyncFunction, options, retryCount, maxRetries, retryDelay]);

  // Retry effect
  useEffect(() => {
    if (retryCount > 0 && retryCount <= maxRetries) {
      const timer = setTimeout(execute, retryDelay * retryCount);
      return () => clearTimeout(timer);
    }
  }, [retryCount, maxRetries, retryDelay, execute]);

  // Auto-execute effect
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const retry = useCallback(() => {
    setRetryCount(0);
    execute();
  }, [execute]);

  return {
    ...state,
    retry,
    isLoading: state.status === 'pending',
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
  };
}
