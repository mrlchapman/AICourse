'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { TabsActivity } from '@/types/activities';

interface Props {
  activity: TabsActivity;
  onUpdate: (updates: Partial<TabsActivity>) => void;
}

export function TabsEditor({ activity, onUpdate }: Props) {
  const updateTab = (index: number, updates: Record<string, string>) => {
    const tabs = (activity.tabs || []).map((t, i) =>
      i === index ? { ...t, ...updates } : t
    );
    onUpdate({ tabs });
  };

  const addTab = () => {
    onUpdate({
      tabs: [
        ...(activity.tabs || []),
        { id: `tab-${Date.now()}`, title: '', content: '' },
      ],
    });
  };

  const removeTab = (index: number) => {
    onUpdate({ tabs: (activity.tabs || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Tabs ({(activity.tabs || []).length})
      </label>
      {(activity.tabs || []).map((tab, i) => (
        <div key={tab.id} className="p-2 border border-border rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">Tab {i + 1}</span>
            {(activity.tabs || []).length > 1 && (
              <button
                onClick={() => removeTab(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
          <input
            type="text"
            value={tab.title}
            onChange={(e) => updateTab(i, { title: e.target.value })}
            placeholder="Tab title"
            className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            value={tab.content}
            onChange={(e) => updateTab(i, { content: e.target.value })}
            placeholder="Tab content (HTML)"
            rows={2}
            className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
          />
        </div>
      ))}
      <button
        onClick={addTab}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Plus className="h-3 w-3" /> Add tab
      </button>
    </div>
  );
}
