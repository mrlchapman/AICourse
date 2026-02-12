'use client';

import { Input } from '@/components/ui';
import type { AudioActivity } from '@/types/activities';

interface Props {
  activity: AudioActivity;
  onUpdate: (updates: Partial<AudioActivity>) => void;
}

export function AudioEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Audio title"
      />

      <Input
        label="Audio URL"
        value={activity.src}
        onChange={(e) => onUpdate({ src: e.target.value })}
        placeholder="https://..."
      />

      {activity.src && (
        <audio controls className="w-full" src={activity.src}>
          Your browser does not support audio.
        </audio>
      )}

      <Input
        label="Description"
        value={activity.description || ''}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Optional description"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Transcript</label>
        <textarea
          value={activity.transcript || ''}
          onChange={(e) => onUpdate({ transcript: e.target.value })}
          placeholder="Optional transcript text..."
          rows={4}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
        />
      </div>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={activity.downloadable ?? false}
          onChange={(e) => onUpdate({ downloadable: e.target.checked })}
        />
        Allow download
      </label>

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
