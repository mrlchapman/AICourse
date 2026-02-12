'use client';

import { Textarea } from '@/components/ui';
import type { DiscussionActivity } from '@/types/activities';

interface Props {
  activity: DiscussionActivity;
  onUpdate: (updates: Partial<DiscussionActivity>) => void;
}

export function DiscussionEditor({ activity, onUpdate }: Props) {
  const config = activity.config || {};

  const updateConfig = (updates: Partial<NonNullable<DiscussionActivity['config']>>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
        <input
          type="text"
          value={activity.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Discussion title"
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <Textarea
        label="Discussion Prompt"
        value={activity.prompt || ''}
        onChange={(e) => onUpdate({ prompt: e.target.value })}
        rows={3}
        placeholder="What should learners discuss?"
      />

      <Textarea
        label="Description (optional)"
        value={activity.description || ''}
        onChange={(e) => onUpdate({ description: e.target.value })}
        rows={2}
        placeholder="Additional context or instructions"
      />

      <Textarea
        label="Guidelines (optional)"
        value={activity.guidelines || ''}
        onChange={(e) => onUpdate({ guidelines: e.target.value })}
        rows={2}
        placeholder="Rules for participation"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Settings</label>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.requireResponse ?? false}
            onChange={(e) => updateConfig({ requireResponse: e.target.checked })}
          />
          Require response
        </label>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.enableReplies ?? true}
            onChange={(e) => updateConfig({ enableReplies: e.target.checked })}
          />
          Enable replies
        </label>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.enableUpvoting ?? false}
            onChange={(e) => updateConfig({ enableUpvoting: e.target.checked })}
          />
          Enable upvoting
        </label>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.allowAnonymous ?? false}
            onChange={(e) => updateConfig({ allowAnonymous: e.target.checked })}
          />
          Allow anonymous posts
        </label>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.moderationEnabled ?? false}
            onChange={(e) => updateConfig({ moderationEnabled: e.target.checked })}
          />
          Enable moderation
        </label>

        {config.requireResponse && (
          <div>
            <label className="text-xs text-foreground-muted">Minimum response length</label>
            <input
              type="number"
              min={0}
              max={1000}
              value={config.minResponseLength || 0}
              onChange={(e) => updateConfig({ minResponseLength: parseInt(e.target.value) || 0 })}
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={activity.required ?? false}
            onChange={(e) => onUpdate({ required: e.target.checked })}
          />
          Required activity
        </label>
      </div>
    </div>
  );
}
