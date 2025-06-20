import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
}

const useApi = <T = any>() => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { token, logout, loading: authLoading } = useAuth();

  const request = useCallback(
    async (endpoint: string, config: RequestConfig = {}) => {
      if (authLoading) return;
      setLoading(true);
      setError(null);
      setData(null);

      const { method = 'GET', body, headers = {} } = config;

      const finalHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      if (token) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
          const errorMessage = "API URL is not configured. Please set NEXT_PUBLIC_API_URL in your environment variables.";
          console.error(errorMessage);
          setError(errorMessage);
          setLoading(false);
          return;
      }

      try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
          method,
          headers: finalHeaders,
          body: body ? JSON.stringify(body) : null,
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            logout();
          }
          let errorResponseMessage = `Request failed with status ${response.status}`;
          try {
            const errorData = await response.json();
            errorResponseMessage = errorData.message || errorData.error || errorResponseMessage;
          } catch (e) {
            // If parsing JSON fails, use statusText or the generic message
            errorResponseMessage = response.statusText || errorResponseMessage;
          }
          throw new Error(errorResponseMessage);
        }

        if (response.status === 204) {
          setData(null);
          return null;
        }
        const result = await response.json();
        setData(result);
        return result;

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, logout, authLoading]
  );

  return { data, error, loading, request };
};

export default useApi;