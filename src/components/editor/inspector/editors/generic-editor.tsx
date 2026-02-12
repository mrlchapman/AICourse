'use client';

import { getActivityDisplayInfo, type Activity } from '@/types/activities';

interface Props {
  activity: Activity;
  onUpdate: (updates: Partial<Activity>) => void;
}

export function GenericEditor({ activity, onUpdate }: Props) {
  const { icon, label } = getActivityDisplayInfo(activity);

  return (
    <div className="space-y-3">
      <div className="p-4 bg-surface-hover rounded-lg text-center">
        <span className="text-3xl block mb-2">{icon}</span>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-foreground-muted mt-1">
          A dedicated editor for this activity type will be added soon.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Raw JSON</label>
        <textarea
          value={JSON.stringify(activity, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onUpdate(parsed);
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={10}
          className="w-full text-xs px-2 py-1.5 font-mono border border-border rounded-md bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
        />
      </div>
    </div>
  );
}
