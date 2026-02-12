'use client';

import { Input } from '@/components/ui';
import type { DividerActivity } from '@/types/activities';

interface Props {
  activity: DividerActivity;
  onUpdate: (updates: Partial<DividerActivity>) => void;
}

const STYLES = ['line', 'dashed', 'dotted', 'gradient', 'space'] as const;

export function DividerEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Style</label>
        <select
          value={activity.style || 'line'}
          onChange={(e) => onUpdate({ style: e.target.value as typeof STYLES[number] })}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
        >
          {STYLES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <Input
        label="Label"
        value={activity.label || ''}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder="Optional text on divider"
      />

      <Input
        label="Height (px)"
        type="number"
        value={activity.height || 1}
        onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 1 })}
        min={1}
        max={100}
      />

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={activity.clickToContinue ?? false}
          onChange={(e) => onUpdate({ clickToContinue: e.target.checked })}
        />
        Click to continue (gate)
      </label>
    </div>
  );
}
