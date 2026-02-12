'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ButtonActivity } from '@/types/activities';

interface Props {
  activity: ButtonActivity;
  onUpdate: (updates: Partial<ButtonActivity>) => void;
}

const VARIANTS = ['primary', 'secondary', 'outline', 'success', 'warning'] as const;
const SIZES = ['small', 'medium', 'large'] as const;
const ALIGNMENTS = ['left', 'center', 'right'] as const;

export function ButtonEditor({ activity, onUpdate }: Props) {
  const updateButton = (index: number, updates: Record<string, unknown>) => {
    const buttons = (activity.buttons || []).map((b, i) =>
      i === index ? { ...b, ...updates } : b
    );
    onUpdate({ buttons });
  };

  const addButton = () => {
    onUpdate({
      buttons: [
        ...(activity.buttons || []),
        {
          id: `btn-${Date.now()}`,
          text: 'Click Here',
          url: '',
          variant: 'primary',
          size: 'medium',
          openInNewTab: true,
        },
      ],
    });
  };

  const removeButton = (index: number) => {
    onUpdate({ buttons: (activity.buttons || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Alignment</label>
        <select
          value={activity.alignment || 'center'}
          onChange={(e) => onUpdate({ alignment: e.target.value as typeof ALIGNMENTS[number] })}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
        >
          {ALIGNMENTS.map((a) => (
            <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Buttons ({(activity.buttons || []).length})
        </label>
        {(activity.buttons || []).map((btn, i) => (
          <div key={btn.id} className="p-2 border border-border rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-muted">Button {i + 1}</span>
              <button
                onClick={() => removeButton(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <input
              type="text"
              value={btn.text}
              onChange={(e) => updateButton(i, { text: e.target.value })}
              placeholder="Button text"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="url"
              value={btn.url}
              onChange={(e) => updateButton(i, { url: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="grid grid-cols-2 gap-1">
              <select
                value={btn.variant || 'primary'}
                onChange={(e) => updateButton(i, { variant: e.target.value })}
                className="text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              >
                {VARIANTS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <select
                value={btn.size || 'medium'}
                onChange={(e) => updateButton(i, { size: e.target.value })}
                className="text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={btn.openInNewTab ?? true}
                onChange={(e) => updateButton(i, { openInNewTab: e.target.checked })}
              />
              Open in new tab
            </label>
          </div>
        ))}
        <button
          onClick={addButton}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add button
        </button>
      </div>
    </div>
  );
}
