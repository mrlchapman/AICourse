'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Input, Textarea } from '@/components/ui';
import type { AccordionActivity } from '@/types/activities';

interface Props {
  activity: AccordionActivity;
  onUpdate: (updates: Partial<AccordionActivity>) => void;
}

export function AccordionEditor({ activity, onUpdate }: Props) {
  const updateSection = (index: number, updates: Record<string, string>) => {
    const sections = (activity.sections || []).map((s, i) =>
      i === index ? { ...s, ...updates } : s
    );
    onUpdate({ sections });
  };

  const addSection = () => {
    onUpdate({
      sections: [
        ...(activity.sections || []),
        { id: `acc-${Date.now()}`, title: '', content: '' },
      ],
    });
  };

  const removeSection = (index: number) => {
    onUpdate({ sections: (activity.sections || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={activity.required || false}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="rounded border-border"
        />
        All sections required
      </label>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Sections ({(activity.sections || []).length})
        </label>
        {(activity.sections || []).map((sec, i) => (
          <div key={sec.id} className="p-2 border border-border rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-muted">Section {i + 1}</span>
              {(activity.sections || []).length > 1 && (
                <button
                  onClick={() => removeSection(i)}
                  className="p-0.5 text-foreground-subtle hover:text-danger"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={sec.title}
              onChange={(e) => updateSection(i, { title: e.target.value })}
              placeholder="Section title"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <textarea
              value={sec.content}
              onChange={(e) => updateSection(i, { content: e.target.value })}
              placeholder="Section content (HTML)"
              rows={2}
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
            />
          </div>
        ))}
        <button
          onClick={addSection}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add section
        </button>
      </div>
    </div>
  );
}
