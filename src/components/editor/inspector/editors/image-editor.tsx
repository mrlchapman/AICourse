'use client';

import { Input, Textarea } from '@/components/ui';
import type { ImageActivity } from '@/types/activities';

interface Props {
  activity: ImageActivity;
  onUpdate: (updates: Partial<ImageActivity>) => void;
}

export function ImageEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Image URL"
        value={activity.src}
        onChange={(e) => onUpdate({ src: e.target.value })}
        placeholder="https://..."
      />
      <Input
        label="Alt Text"
        value={activity.alt}
        onChange={(e) => onUpdate({ alt: e.target.value })}
        placeholder="Describe the image"
      />
      <Input
        label="Caption"
        value={activity.caption || ''}
        onChange={(e) => onUpdate({ caption: e.target.value || undefined })}
        placeholder="Optional caption"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={activity.required || false}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="rounded border-border"
        />
        Required to view
      </label>
    </div>
  );
}
