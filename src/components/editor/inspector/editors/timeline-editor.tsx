'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui';
import type { TimelineActivity } from '@/types/activities';

interface Props {
  activity: TimelineActivity;
  onUpdate: (updates: Partial<TimelineActivity>) => void;
}

export function TimelineEditor({ activity, onUpdate }: Props) {
  const updateEvent = (index: number, updates: Record<string, string>) => {
    const events = (activity.events || []).map((e, i) =>
      i === index ? { ...e, ...updates } : e
    );
    onUpdate({ events });
  };

  const addEvent = () => {
    onUpdate({
      events: [
        ...(activity.events || []),
        { id: `evt-${Date.now()}`, title: '', date: '', content: '' },
      ],
    });
  };

  const removeEvent = (index: number) => {
    onUpdate({ events: (activity.events || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Timeline title"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Events ({(activity.events || []).length})
        </label>
        {(activity.events || []).map((event, i) => (
          <div key={event.id} className="p-2 border border-border rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-muted">Event {i + 1}</span>
              <button
                onClick={() => removeEvent(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <input
              type="text"
              value={event.date || ''}
              onChange={(e) => updateEvent(i, { date: e.target.value })}
              placeholder="Date (e.g. 1969, March 2020)"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={event.title}
              onChange={(e) => updateEvent(i, { title: e.target.value })}
              placeholder="Event title"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <textarea
              value={event.content}
              onChange={(e) => updateEvent(i, { content: e.target.value })}
              placeholder="Event description..."
              rows={2}
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
            />
          </div>
        ))}
        <button
          onClick={addEvent}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add event
        </button>
      </div>
    </div>
  );
}
