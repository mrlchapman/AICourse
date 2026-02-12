'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui';
import type { SortingActivity } from '@/types/activities';

interface Props {
  activity: SortingActivity;
  onUpdate: (updates: Partial<SortingActivity>) => void;
}

export function SortingEditor({ activity, onUpdate }: Props) {
  const addCategory = () => {
    onUpdate({
      categories: [
        ...activity.categories,
        { id: `cat-${Date.now()}`, title: '' },
      ],
    });
  };

  const updateCategory = (index: number, title: string) => {
    const categories = activity.categories.map((c, i) =>
      i === index ? { ...c, title } : c
    );
    onUpdate({ categories });
  };

  const removeCategory = (index: number) => {
    const catId = activity.categories[index].id;
    onUpdate({
      categories: activity.categories.filter((_, i) => i !== index),
      items: activity.items.filter((item) => item.categoryId !== catId),
    });
  };

  const addItem = () => {
    onUpdate({
      items: [
        ...activity.items,
        {
          id: `item-${Date.now()}`,
          text: '',
          categoryId: activity.categories[0]?.id || '',
        },
      ],
    });
  };

  const updateItem = (index: number, updates: Record<string, string>) => {
    const items = activity.items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onUpdate({ items });
  };

  const removeItem = (index: number) => {
    onUpdate({ items: activity.items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
      />

      {/* Categories */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Categories ({activity.categories.length})
        </label>
        {activity.categories.map((cat, i) => (
          <div key={cat.id} className="flex items-center gap-1">
            <input
              type="text"
              value={cat.title}
              onChange={(e) => updateCategory(i, e.target.value)}
              placeholder={`Category ${i + 1}`}
              className="flex-1 text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={() => removeCategory(i)}
              className="p-0.5 text-foreground-subtle hover:text-danger shrink-0"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          onClick={addCategory}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add category
        </button>
      </div>

      {/* Items */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Items ({activity.items.length})
        </label>
        {activity.items.map((item, i) => (
          <div key={item.id} className="p-2 border border-border rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-muted">Item {i + 1}</span>
              <button
                onClick={() => removeItem(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(i, { text: e.target.value })}
              placeholder="Item text"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <select
              value={item.categoryId}
              onChange={(e) => updateItem(i, { categoryId: e.target.value })}
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select category...</option>
              {activity.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.title || 'Untitled'}</option>
              ))}
            </select>
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
          disabled={activity.categories.length === 0}
        >
          <Plus className="h-3 w-3" /> Add item
        </button>
      </div>
    </div>
  );
}
