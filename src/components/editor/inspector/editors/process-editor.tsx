'use client';

import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { ProcessActivity } from '@/types/activities';

interface Props {
  activity: ProcessActivity;
  onUpdate: (updates: Partial<ProcessActivity>) => void;
}

export function ProcessEditor({ activity, onUpdate }: Props) {
  const updateStep = (index: number, updates: Record<string, string>) => {
    const steps = activity.steps.map((s, i) =>
      i === index ? { ...s, ...updates } : s
    );
    onUpdate({ steps });
  };

  const addStep = () => {
    onUpdate({
      steps: [
        ...activity.steps,
        { id: `step-${Date.now()}`, title: '', content: '' },
      ],
    });
  };

  const removeStep = (index: number) => {
    onUpdate({ steps: activity.steps.filter((_, i) => i !== index) });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const steps = [...activity.steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
    onUpdate({ steps });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Steps ({activity.steps.length})
      </label>

      {activity.steps.map((step, i) => (
        <div key={step.id} className="p-2 border border-border rounded-md space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">Step {i + 1}</span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => moveStep(i, 'up')}
                disabled={i === 0}
                className="p-0.5 text-foreground-subtle hover:text-foreground disabled:opacity-30"
              >
                <ArrowUp className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={() => moveStep(i, 'down')}
                disabled={i === activity.steps.length - 1}
                className="p-0.5 text-foreground-subtle hover:text-foreground disabled:opacity-30"
              >
                <ArrowDown className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={() => removeStep(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
          <input
            type="text"
            value={step.title}
            onChange={(e) => updateStep(i, { title: e.target.value })}
            placeholder="Step title"
            className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            value={step.content}
            onChange={(e) => updateStep(i, { content: e.target.value })}
            placeholder="Step description..."
            rows={2}
            className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
          />
        </div>
      ))}

      <button
        onClick={addStep}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Plus className="h-3 w-3" /> Add step
      </button>
    </div>
  );
}
