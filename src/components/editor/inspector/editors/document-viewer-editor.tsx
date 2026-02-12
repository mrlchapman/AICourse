'use client';

import { Input } from '@/components/ui';
import type { DocumentViewerActivity } from '@/types/activities';

interface Props {
  activity: DocumentViewerActivity;
  onUpdate: (updates: Partial<DocumentViewerActivity>) => void;
}

export function DocumentViewerEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Document title"
      />

      <Input
        label="Document URL"
        value={activity.documentUrl}
        onChange={(e) => onUpdate({ documentUrl: e.target.value })}
        placeholder="https://..."
      />

      {activity.documentUrl && (
        <div className="rounded-md border border-border overflow-hidden">
          <iframe
            src={activity.documentUrl}
            className="w-full h-48"
            title={activity.title || 'Document'}
          />
        </div>
      )}
    </div>
  );
}
