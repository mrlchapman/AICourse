'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui';
import type { MatchingActivity } from '@/types/activities';

interface Props {
  activity: MatchingActivity;
  onUpdate: (updates: Partial<MatchingActivity>) => void;
}

export function MatchingEditor({ activity, onUpdate }: Props) {
  const updatePair = (index: number, updates: Record<string, string>) => {
    const pairs = activity.pairs.map((p, i) =>
      i === index ? { ...p, ...updates } : p
    );
    onUpdate({ pairs });
  };

  const addPair = () => {
    onUpdate({
      pairs: [
        ...activity.pairs,
        { id: `pair-${Date.now()}`, left: '', right: '' },
      ],
    });
  };

  const removePair = (index: number) => {
    onUpdate({ pairs: activity.pairs.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Pairs ({activity.pairs.length})
        </label>
        {activity.pairs.map((pair, i) => (
          <div key={pair.id} className="p-2 border border-border rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-muted">Pair {i + 1}</span>
              <button
                onClick={() => removePair(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <input
              type="text"
              value={pair.left}
              onChange={(e) => updatePair(i, { left: e.target.value })}
              placeholder="Left item"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={pair.right}
              onChange={(e) => updatePair(i, { right: e.target.value })}
              placeholder="Right match"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
        <button
          onClick={addPair}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add pair
        </button>
      </div>
    </div>
  );
}
