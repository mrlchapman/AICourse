'use client';

import { Input } from '@/components/ui';
import type { EmbedActivity } from '@/types/activities';

interface Props {
  activity: EmbedActivity;
  onUpdate: (updates: Partial<EmbedActivity>) => void;
}

export function EmbedEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Embed title"
      />

      <Input
        label="URL"
        value={activity.url}
        onChange={(e) => onUpdate({ url: e.target.value })}
        placeholder="https://..."
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Embed Code</label>
        <textarea
          value={activity.embedCode || ''}
          onChange={(e) => onUpdate({ embedCode: e.target.value })}
          placeholder="<iframe>...</iframe> (optional, overrides URL)"
          rows={4}
          className="w-full text-xs px-2 py-1.5 font-mono border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
        />
      </div>

      <Input
        label="Caption"
        value={activity.caption || ''}
        onChange={(e) => onUpdate({ caption: e.target.value })}
        placeholder="Optional caption"
      />

      <Input
        label="Aspect Ratio"
        value={activity.aspectRatio || '16/9'}
        onChange={(e) => onUpdate({ aspectRatio: e.target.value })}
        placeholder="16/9"
        hint="e.g. 16/9, 4/3, 1/1"
      />

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={activity.required ?? false}
          onChange={(e) => onUpdate({ required: e.target.checked })}
        />
        Required
      </label>
    </div>
  );
}
