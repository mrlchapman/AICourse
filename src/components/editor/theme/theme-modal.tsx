'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import type { CourseThemeConfig } from '@/types/activities';

interface ThemeModalProps {
  theme?: CourseThemeConfig;
  onUpdate: (theme: CourseThemeConfig) => void;
  onClose: () => void;
}

export const THEME_PRESETS: {
  id: CourseThemeConfig['themePreset'];
  name: string;
  description: string;
  preview: { bg: string; text: string; primary: string; surface: string };
  config: Omit<CourseThemeConfig, 'themePreset'>;
}[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and modern',
    preview: { bg: '#ffffff', text: '#1a1a2e', primary: '#6366f1', surface: '#f8fafc' },
    config: {
      primaryColor: '#6366f1',
      backgroundColor: '#ffffff',
      textColor: '#1a1a2e',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes',
    preview: { bg: '#0f172a', text: '#e2e8f0', primary: '#818cf8', surface: '#1e293b' },
    config: {
      primaryColor: '#818cf8',
      backgroundColor: '#0f172a',
      textColor: '#e2e8f0',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Warm and readable',
    preview: { bg: '#faf8f5', text: '#2d2926', primary: '#c4841d', surface: '#f0ece4' },
    config: {
      primaryColor: '#c4841d',
      backgroundColor: '#faf8f5',
      textColor: '#2d2926',
      fontFamily: 'Georgia, serif',
    },
  },
  {
    id: 'editorial-dark',
    name: 'Editorial Dark',
    description: 'Warm dark theme',
    preview: { bg: '#1a1612', text: '#e8ddd0', primary: '#d4a04a', surface: '#2a241e' },
    config: {
      primaryColor: '#d4a04a',
      backgroundColor: '#1a1612',
      textColor: '#e8ddd0',
      fontFamily: 'Georgia, serif',
    },
  },
  {
    id: 'accessible',
    name: 'Accessible',
    description: 'High contrast',
    preview: { bg: '#ffffff', text: '#000000', primary: '#0052cc', surface: '#f0f0f0' },
    config: {
      primaryColor: '#0052cc',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Atkinson Hyperlegible, Arial, sans-serif',
    },
  },
  {
    id: 'holographic',
    name: 'Holographic',
    description: 'Futuristic gradient',
    preview: { bg: '#0a0a1a', text: '#e0e7ff', primary: '#a78bfa', surface: '#1a1a3e' },
    config: {
      primaryColor: '#a78bfa',
      backgroundColor: '#0a0a1a',
      textColor: '#e0e7ff',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  },
];

const DEFAULT_THEME: CourseThemeConfig = {
  themePreset: 'light',
  ...THEME_PRESETS[0].config,
};

export function ThemeModal({ theme, onUpdate, onClose }: ThemeModalProps) {
  const [current, setCurrent] = useState<CourseThemeConfig>(theme || DEFAULT_THEME);

  const selectPreset = (preset: typeof THEME_PRESETS[0]) => {
    const updated: CourseThemeConfig = {
      ...current,
      themePreset: preset.id,
      ...preset.config,
    };
    setCurrent(updated);
  };

  const handleSave = () => {
    onUpdate(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Course Theme</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Presets */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-2">
              Theme Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset)}
                  className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                    current.themePreset === preset.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-foreground-subtle'
                  }`}
                >
                  {/* Color preview */}
                  <div
                    className="w-full h-12 rounded-md mb-2 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: preset.preview.bg }}
                  >
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.preview.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.preview.text }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.preview.surface }} />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-foreground">{preset.name}</p>
                  <p className="text-[10px] text-foreground-muted">{preset.description}</p>

                  {current.themePreset === preset.id && (
                    <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-foreground-subtle uppercase tracking-wider">
              Customise
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-foreground-muted mb-1">Primary Colour</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={current.primaryColor}
                    onChange={(e) => setCurrent({ ...current, primaryColor: e.target.value, themePreset: undefined })}
                    className="w-8 h-8 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={current.primaryColor}
                    onChange={(e) => setCurrent({ ...current, primaryColor: e.target.value, themePreset: undefined })}
                    className="flex-1 text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-foreground-muted mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={current.backgroundColor}
                    onChange={(e) => setCurrent({ ...current, backgroundColor: e.target.value, themePreset: undefined })}
                    className="w-8 h-8 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={current.backgroundColor}
                    onChange={(e) => setCurrent({ ...current, backgroundColor: e.target.value, themePreset: undefined })}
                    className="flex-1 text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-foreground-muted mb-1">Text Colour</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={current.textColor}
                    onChange={(e) => setCurrent({ ...current, textColor: e.target.value, themePreset: undefined })}
                    className="w-8 h-8 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={current.textColor}
                    onChange={(e) => setCurrent({ ...current, textColor: e.target.value, themePreset: undefined })}
                    className="flex-1 text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-foreground-muted mb-1">Font</label>
                <select
                  value={current.fontFamily}
                  onChange={(e) => setCurrent({ ...current, fontFamily: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Inter, system-ui, sans-serif">Inter (Modern)</option>
                  <option value="Georgia, serif">Georgia (Serif)</option>
                  <option value="Atkinson Hyperlegible, Arial, sans-serif">Atkinson (Accessible)</option>
                  <option value="'Courier New', monospace">Courier (Mono)</option>
                  <option value="system-ui, sans-serif">System Default</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Apply Theme
          </Button>
        </div>
      </div>
    </div>
  );
}
