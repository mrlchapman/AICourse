'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input, Textarea, Button } from '@/components/ui';
import type { KnowledgeCheckActivity } from '@/types/activities';

interface Props {
  activity: KnowledgeCheckActivity;
  onUpdate: (updates: Partial<KnowledgeCheckActivity>) => void;
}

export function KnowledgeCheckEditor({ activity, onUpdate }: Props) {
  const updateOption = (index: number, updates: Partial<{ text: string; correct: boolean }>) => {
    const options = (activity.options || []).map((opt, i) => {
      if (i !== index) {
        // If setting this one as correct, un-correct others
        if (updates.correct) return { ...opt, correct: false };
        return opt;
      }
      return { ...opt, ...updates };
    });
    onUpdate({ options });
  };

  const addOption = () => {
    onUpdate({
      options: [
        ...(activity.options || []),
        { id: `opt-${Date.now()}`, text: '', correct: false },
      ],
    });
  };

  const removeOption = (index: number) => {
    onUpdate({
      options: (activity.options || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-3">
      <Textarea
        label="Question"
        value={activity.question}
        onChange={(e) => onUpdate({ question: e.target.value })}
        rows={2}
        placeholder="What is...?"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Options</label>
        <div className="space-y-2">
          {(activity.options || []).map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2">
              <input
                type="radio"
                checked={opt.correct}
                onChange={() => updateOption(i, { correct: true })}
                className="shrink-0"
              />
              <input
                type="text"
                value={opt.text}
                onChange={(e) => updateOption(i, { text: e.target.value })}
                placeholder={`Option ${i + 1}`}
                className="flex-1 text-sm px-2 py-1 border border-border rounded-md bg-surface focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
              />
              {(activity.options || []).length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="p-1 text-foreground-subtle hover:text-danger transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        {(activity.options || []).length < 6 && (
          <button
            onClick={addOption}
            className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Add option
          </button>
        )}
      </div>

      <Textarea
        label="Explanation"
        value={activity.explanation || ''}
        onChange={(e) => onUpdate({ explanation: e.target.value })}
        rows={2}
        placeholder="Why this answer is correct..."
      />
    </div>
  );
}
