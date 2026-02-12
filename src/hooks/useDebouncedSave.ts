'use client';

import { useCallback, useRef, useEffect } from 'react';
import type { CourseContent } from '@/types/activities';

interface UseDebouncedSaveOptions {
  onSave: (content: CourseContent) => Promise<void>;
  delay?: number;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
  onError?: (error: Error) => void;
}

export function useDebouncedSave({
  onSave,
  delay = 2000,
  onSaveStart,
  onSaveEnd,
  onError,
}: UseDebouncedSaveOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<CourseContent | null>(null);

  const debouncedSave = useCallback(
    (content: CourseContent) => {
      pendingSaveRef.current = content;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        const contentToSave = pendingSaveRef.current;
        if (!contentToSave) return;

        pendingSaveRef.current = null;
        onSaveStart?.();

        try {
          await onSave(contentToSave);
        } catch (error) {
          onError?.(error as Error);
        } finally {
          onSaveEnd?.();
        }
      }, delay);
    },
    [onSave, delay, onSaveStart, onSaveEnd, onError]
  );

  const flushSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const contentToSave = pendingSaveRef.current;
    if (!contentToSave) return;

    pendingSaveRef.current = null;
    onSaveStart?.();
    try {
      await onSave(contentToSave);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      onSaveEnd?.();
    }
  }, [onSave, onSaveStart, onSaveEnd, onError]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedSave, flushSave };
}
