'use client';

import { Input } from '@/components/ui';
import type { ScreenRecordingActivity } from '@/types/activities';

interface Props {
  activity: ScreenRecordingActivity;
  onUpdate: (updates: Partial<ScreenRecordingActivity>) => void;
}

export function ScreenRecordingEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Recording title"
      />

      <Input
        label="Description"
        value={activity.description || ''}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Optional description"
      />

      <Input
        label="Drive File ID"
        value={activity.driveFileId}
        onChange={(e) => onUpdate({ driveFileId: e.target.value })}
        placeholder="Google Drive file ID"
      />

      <Input
        label="Thumbnail URL"
        value={activity.thumbnailUrl || ''}
        onChange={(e) => onUpdate({ thumbnailUrl: e.target.value })}
        placeholder="https://..."
      />

      {activity.thumbnailUrl && (
        <img
          src={activity.thumbnailUrl}
          alt="Thumbnail"
          className="w-full rounded-md border border-border"
        />
      )}

      <Input
        label="Duration (seconds)"
        type="number"
        value={activity.duration || 0}
        onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || 0 })}
        min={0}
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
