'use client';

import { Input } from '@/components/ui';
import type { YouTubeActivity } from '@/types/activities';

interface Props {
  activity: YouTubeActivity;
  onUpdate: (updates: Partial<YouTubeActivity>) => void;
}

function extractVideoId(input: string): string {
  // Handle full URLs
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^[a-zA-Z0-9_-]{11}$/,
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1] || input;
  }
  return input;
}

export function YouTubeEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="YouTube URL or Video ID"
        value={activity.videoId}
        onChange={(e) => onUpdate({ videoId: extractVideoId(e.target.value) })}
        placeholder="https://youtube.com/watch?v=... or dQw4w9WgXcQ"
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
        Required to watch
      </label>
      {activity.videoId && (
        <div className="aspect-video bg-black rounded-md overflow-hidden">
          <img
            src={`https://img.youtube.com/vi/${activity.videoId}/mqdefault.jpg`}
            alt="Video preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
