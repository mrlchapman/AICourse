'use client';

import { useState, useCallback } from 'react';
import type { Activity } from '@/types/activities';

interface UseActivityClipboardOptions {
  onCopy?: (activity: Activity) => void;
}

export function useActivityClipboard({ onCopy }: UseActivityClipboardOptions = {}) {
  const [copiedActivity, setCopiedActivity] = useState<Activity | null>(null);

  const copyActivity = useCallback(
    (activity: Activity) => {
      setCopiedActivity(structuredClone(activity));
      onCopy?.(activity);
    },
    [onCopy]
  );

  const createPastedActivity = useCallback((): Activity | null => {
    if (!copiedActivity) return null;
    return {
      ...structuredClone(copiedActivity),
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    } as Activity;
  }, [copiedActivity]);

  const duplicateActivity = useCallback((activity: Activity): Activity => {
    return {
      ...structuredClone(activity),
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      editorLabel: activity.editorLabel ? `${activity.editorLabel} (copy)` : undefined,
    } as Activity;
  }, []);

  return {
    copiedActivity,
    copyActivity,
    createPastedActivity,
    duplicateActivity,
    hasCopied: !!copiedActivity,
  };
}
