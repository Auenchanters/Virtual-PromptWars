import { useState, useCallback, useEffect } from 'react';
import { chatGemini } from '../services/api';

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
  
    return debouncedValue;
}

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (msg: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await chatGemini(msg);
      return resp;
    } catch (err) {
      setError('Failed to fetch response');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendMessage, loading, error };
}
