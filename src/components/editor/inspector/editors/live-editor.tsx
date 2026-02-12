'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui';
import type { LiveActivity } from '@/types/activities';

interface Props {
  activity: LiveActivity;
  onUpdate: (updates: Partial<LiveActivity>) => void;
}

export function LiveEditor({ activity, onUpdate }: Props) {
  const updateOption = (index: number, text: string) => {
    const options = (activity.options || []).map((o, i) =>
      i === index ? { ...o, text } : o
    );
    onUpdate({ options });
  };

  const addOption = () => {
    onUpdate({
      options: [
        ...(activity.options || []),
        { id: `opt-${Date.now()}`, text: '' },
      ],
    });
  };

  const removeOption = (index: number) => {
    onUpdate({ options: (activity.options || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Activity Type</label>
        <select
          value={activity.activityType}
          onChange={(e) => onUpdate({ activityType: e.target.value as 'poll' | 'open_question' })}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="poll">Poll</option>
          <option value="open_question">Open Question</option>
        </select>
      </div>

      <Input
        label="Question"
        value={activity.question}
        onChange={(e) => onUpdate({ question: e.target.value })}
        placeholder="Ask your audience..."
      />

      <Input
        label="Description"
        value={activity.description || ''}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Optional description"
      />

      <Input
        label="Image URL"
        value={activity.imageUrl || ''}
        onChange={(e) => onUpdate({ imageUrl: e.target.value })}
        placeholder="Optional image"
      />

      {activity.activityType === 'poll' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Options ({(activity.options || []).length})
          </label>
          {(activity.options || []).map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-1">
              <input
                type="text"
                value={opt.text}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => removeOption(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger shrink-0"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Add option
          </button>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Settings</label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={activity.config?.showResults ?? true}
            onChange={(e) => onUpdate({ config: { ...activity.config, showResults: e.target.checked } })}
          />
          Show results to students
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={activity.config?.anonymous ?? false}
            onChange={(e) => onUpdate({ config: { ...activity.config, anonymous: e.target.checked } })}
          />
          Anonymous responses
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={activity.config?.allowMultipleResponses ?? false}
            onChange={(e) => onUpdate({ config: { ...activity.config, allowMultipleResponses: e.target.checked } })}
          />
          Allow multiple responses
        </label>
      </div>
    </div>
  );
}
