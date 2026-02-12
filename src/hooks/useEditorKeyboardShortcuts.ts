'use client';

import { useEffect } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
}

export function useEditorKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      // Don't intercept shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isMod && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
        return;
      }

      if (isInput) return;

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo?.();
      } else if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handlers.onRedo?.();
      } else if (isMod && e.key === 'y') {
        e.preventDefault();
        handlers.onRedo?.();
      } else if (isMod && e.key === 'c') {
        e.preventDefault();
        handlers.onCopy?.();
      } else if (isMod && e.key === 'v') {
        e.preventDefault();
        handlers.onPaste?.();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handlers.onDelete?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
