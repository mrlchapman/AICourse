'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui';
import type { FillInBlankActivity } from '@/types/activities';

interface Props {
  activity: FillInBlankActivity;
  onUpdate: (updates: Partial<FillInBlankActivity>) => void;
}

export function FillInBlankEditor({ activity, onUpdate }: Props) {
  const updateBlank = (index: number, updates: Record<string, unknown>) => {
    const blanks = activity.blanks.map((b, i) =>
      i === index ? { ...b, ...updates } : b
    );
    onUpdate({ blanks });
  };

  const addBlank = () => {
    const newBlankIndex = activity.blanks.length;
    onUpdate({
      blanks: [
        ...activity.blanks,
        { id: `blank-${Date.now()}`, answers: [''], hint: '' },
      ],
      text: activity.text + ` {${newBlankIndex}}`,
    });
  };

  const removeBlank = (index: number) => {
    onUpdate({
      blanks: activity.blanks.filter((_, i) => i !== index),
    });
  };

  const addAnswer = (blankIndex: number) => {
    const blank = activity.blanks[blankIndex];
    updateBlank(blankIndex, { answers: [...blank.answers, ''] });
  };

  const updateAnswer = (blankIndex: number, answerIndex: number, value: string) => {
    const blank = activity.blanks[blankIndex];
    const answers = blank.answers.map((a, i) => (i === answerIndex ? value : a));
    updateBlank(blankIndex, { answers });
  };

  const removeAnswer = (blankIndex: number, answerIndex: number) => {
    const blank = activity.blanks[blankIndex];
    updateBlank(blankIndex, { answers: blank.answers.filter((_, i) => i !== answerIndex) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="Instruction"
        value={activity.instruction || ''}
        onChange={(e) => onUpdate({ instruction: e.target.value })}
        placeholder="Fill in the missing words"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Text with Blanks
        </label>
        <p className="text-xs text-foreground-muted mb-1">
          Use {'{0}'}, {'{1}'}, etc. for blank positions.
        </p>
        <textarea
          value={activity.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="The {0} is the powerhouse of the {1}."
          rows={4}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
        />
      </div>

      {/* Blanks */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Blanks ({activity.blanks.length})
        </label>
        {activity.blanks.map((blank, bi) => (
          <div key={blank.id} className="p-2 border border-border rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">{`{${bi}}`}</span>
              <button
                onClick={() => removeBlank(bi)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            {blank.answers.map((answer, ai) => (
              <div key={ai} className="flex items-center gap-1">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => updateAnswer(bi, ai, e.target.value)}
                  placeholder={`Accepted answer ${ai + 1}`}
                  className="flex-1 text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                />
                {blank.answers.length > 1 && (
                  <button
                    onClick={() => removeAnswer(bi, ai)}
                    className="p-0.5 text-foreground-subtle hover:text-danger shrink-0"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addAnswer(bi)}
              className="text-xs text-primary hover:underline"
            >
              + Add accepted answer
            </button>
            <input
              type="text"
              value={blank.hint || ''}
              onChange={(e) => updateBlank(bi, { hint: e.target.value })}
              placeholder="Hint (optional)"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
        <button
          onClick={addBlank}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add blank
        </button>
      </div>

      {/* Config */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Options</label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={activity.config?.useWordBank ?? false}
            onChange={(e) =>
              onUpdate({ config: { ...activity.config, useWordBank: e.target.checked } })
            }
          />
          Show word bank
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={activity.config?.caseSensitive ?? false}
            onChange={(e) =>
              onUpdate({ config: { ...activity.config, caseSensitive: e.target.checked } })
            }
          />
          Case sensitive
        </label>
      </div>
    </div>
  );
}
