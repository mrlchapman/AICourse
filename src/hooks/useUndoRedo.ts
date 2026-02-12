'use client';

import { useState, useCallback, useRef } from 'react';
import type { CourseContent } from '@/types/activities';

const MAX_HISTORY_SIZE = 50;

function deepClone<T>(obj: T): T {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

export function useUndoRedo(initialContent: CourseContent) {
  const [content, setContentState] = useState<CourseContent>(initialContent);
  const historyRef = useRef<CourseContent[]>([deepClone(initialContent)]);
  const indexRef = useRef(0);
  const skipNextPushRef = useRef(false);

  const pushState = useCallback((newContent: CourseContent) => {
    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }

    const history = historyRef.current;
    const currentIndex = indexRef.current;

    // Trim future states
    historyRef.current = history.slice(0, currentIndex + 1);
    historyRef.current.push(deepClone(newContent));

    // Enforce max size
    if (historyRef.current.length > MAX_HISTORY_SIZE) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY_SIZE);
    }

    indexRef.current = historyRef.current.length - 1;
  }, []);

  const setContent = useCallback(
    (newContent: CourseContent | ((prev: CourseContent) => CourseContent), shouldPushHistory = true) => {
      setContentState((prev) => {
        const next = typeof newContent === 'function' ? newContent(prev) : newContent;
        if (shouldPushHistory) {
          pushState(next);
        }
        return next;
      });
    },
    [pushState]
  );

  const undo = useCallback((): boolean => {
    if (indexRef.current <= 0) return false;

    indexRef.current -= 1;
    skipNextPushRef.current = true;
    const state = deepClone(historyRef.current[indexRef.current]);
    setContentState(state);
    return true;
  }, []);

  const redo = useCallback((): boolean => {
    if (indexRef.current >= historyRef.current.length - 1) return false;

    indexRef.current += 1;
    skipNextPushRef.current = true;
    const state = deepClone(historyRef.current[indexRef.current]);
    setContentState(state);
    return true;
  }, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [deepClone(content)];
    indexRef.current = 0;
  }, [content]);

  const resetContent = useCallback((newContent: CourseContent) => {
    historyRef.current = [deepClone(newContent)];
    indexRef.current = 0;
    setContentState(newContent);
  }, []);

  return {
    content,
    setContent,
    undo,
    redo,
    clearHistory,
    resetContent,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < historyRef.current.length - 1,
    historyLength: historyRef.current.length,
  };
}
