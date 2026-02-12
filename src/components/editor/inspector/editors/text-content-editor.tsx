'use client';

import { Textarea } from '@/components/ui';
import type { TextContentActivity } from '@/types/activities';

interface Props {
  activity: TextContentActivity;
  onUpdate: (updates: Partial<TextContentActivity>) => void;
}

export function TextContentEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Textarea
        label="Content (HTML)"
        value={activity.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        rows={8}
        placeholder="<p>Enter your text here...</p>"
      />
      <p className="text-xs text-foreground-subtle">
        Supports HTML formatting. A rich text editor will be added in a future update.
      </p>
    </div>
  );
}
