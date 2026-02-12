'use client';

import { Input } from '@/components/ui';
import type { VideoActivity } from '@/types/activities';

interface Props {
  activity: VideoActivity;
  onUpdate: (updates: Partial<VideoActivity>) => void;
}

export function VideoEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Video URL"
        value={activity.src}
        onChange={(e) => onUpdate({ src: e.target.value })}
        placeholder="https://..."
      />

      {activity.src && (
        <div className="rounded-md border border-border overflow-hidden">
          <video controls className="w-full" src={activity.src}>
            Your browser does not support video.
          </video>
        </div>
      )}

      <Input
        label="Caption"
        value={activity.caption || ''}
        onChange={(e) => onUpdate({ caption: e.target.value })}
        placeholder="Optional caption"
      />
    </div>
  );
}
