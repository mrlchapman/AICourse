'use client';

import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui';
import type { SequenceActivity } from '@/types/activities';

interface Props {
  activity: SequenceActivity;
  onUpdate: (updates: Partial<SequenceActivity>) => void;
}

export function SequenceEditor({ activity, onUpdate }: Props) {
  const updateItem = (index: number, text: string) => {
    const items = activity.items.map((item, i) =>
      i === index ? { ...item, text } : item
    );
    onUpdate({ items });
  };

  const addItem = () => {
    onUpdate({
      items: [
        ...activity.items,
        { id: `seq-${Date.now()}`, text: '', order: activity.items.length },
      ],
    });
  };

  const removeItem = (index: number) => {
    onUpdate({
      items: activity.items
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, order: i })),
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const items = [...activity.items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    onUpdate({ items: items.map((item, i) => ({ ...item, order: i })) });
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
          Items - Correct Order ({activity.items.length})
        </label>
        <p className="text-xs text-foreground-muted">
          Arrange in the correct order. Students will see them shuffled.
        </p>
        {activity.items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-1">
            <span className="text-xs font-medium text-foreground-muted w-5 text-center shrink-0">
              {i + 1}
            </span>
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`Step ${i + 1}`}
              className="flex-1 text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex flex-col shrink-0">
              <button
                onClick={() => moveItem(i, 'up')}
                disabled={i === 0}
                className="p-0.5 text-foreground-subtle hover:text-foreground disabled:opacity-30"
              >
                <ArrowUp className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={() => moveItem(i, 'down')}
                disabled={i === activity.items.length - 1}
                className="p-0.5 text-foreground-subtle hover:text-foreground disabled:opacity-30"
              >
                <ArrowDown className="h-2.5 w-2.5" />
              </button>
            </div>
            <button
              onClick={() => removeItem(i)}
              className="p-0.5 text-foreground-subtle hover:text-danger shrink-0"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add item
        </button>
      </div>
    </div>
  );
}
