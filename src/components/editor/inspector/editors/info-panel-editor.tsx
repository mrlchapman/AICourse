'use client';

import { Input, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { InfoPanelActivity } from '@/types/activities';

interface Props {
  activity: InfoPanelActivity;
  onUpdate: (updates: Partial<InfoPanelActivity>) => void;
}

const variants = [
  { value: 'info', label: 'Info', color: 'bg-primary-light border-primary text-primary' },
  { value: 'warning', label: 'Warning', color: 'bg-warning-light border-warning text-amber-700' },
  { value: 'success', label: 'Success', color: 'bg-success-light border-success text-green-700' },
  { value: 'error', label: 'Error', color: 'bg-danger-light border-danger text-red-700' },
] as const;

export function InfoPanelEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Variant</label>
        <div className="grid grid-cols-2 gap-1.5">
          {variants.map((v) => (
            <button
              key={v.value}
              onClick={() => onUpdate({ variant: v.value })}
              className={cn(
                'px-2 py-1.5 text-xs font-medium rounded-md border transition-colors',
                activity.variant === v.value ? v.color : 'bg-surface border-border text-foreground-muted'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <Input
        label="Title"
        value={activity.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
      />
      <Textarea
        label="Content"
        value={activity.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        rows={3}
      />
    </div>
  );
}
