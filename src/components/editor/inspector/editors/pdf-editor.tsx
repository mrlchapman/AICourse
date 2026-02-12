'use client';

import { Input } from '@/components/ui';
import type { PDFActivity } from '@/types/activities';

interface Props {
  activity: PDFActivity;
  onUpdate: (updates: Partial<PDFActivity>) => void;
}

export function PDFEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Document title"
      />

      <Input
        label="PDF URL"
        value={activity.pdfUrl}
        onChange={(e) => onUpdate({ pdfUrl: e.target.value })}
        placeholder="https://drive.google.com/file/d/..."
      />

      {activity.pdfUrl && (
        <div className="rounded-md border border-border overflow-hidden">
          <iframe
            src={activity.pdfUrl}
            className="w-full h-48"
            title={activity.title || 'PDF Preview'}
          />
        </div>
      )}

      <Input
        label="Drive File ID"
        value={activity.driveFileId || ''}
        onChange={(e) => onUpdate({ driveFileId: e.target.value })}
        placeholder="Optional Google Drive file ID"
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
