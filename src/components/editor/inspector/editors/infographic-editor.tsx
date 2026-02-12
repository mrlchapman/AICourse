'use client';

import { Input } from '@/components/ui';
import type { InfographicActivity } from '@/types/activities';

interface Props {
  activity: InfographicActivity;
  onUpdate: (updates: Partial<InfographicActivity>) => void;
}

export function InfographicEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Infographic title"
      />

      <Input
        label="Image URL"
        value={activity.src}
        onChange={(e) => onUpdate({ src: e.target.value })}
        placeholder="https://..."
      />

      {activity.src && (
        <img
          src={activity.src}
          alt={activity.alt || ''}
          className="w-full rounded-md border border-border"
        />
      )}

      <Input
        label="Alt Text"
        value={activity.alt}
        onChange={(e) => onUpdate({ alt: e.target.value })}
        placeholder="Describe the infographic"
      />

      <Input
        label="Caption"
        value={activity.caption || ''}
        onChange={(e) => onUpdate({ caption: e.target.value })}
        placeholder="Optional caption"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">AI Prompt</label>
        <textarea
          value={activity.infographicPrompt || ''}
          onChange={(e) => onUpdate({ infographicPrompt: e.target.value })}
          placeholder="The prompt used to generate this infographic..."
          rows={4}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
        />
      </div>

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
