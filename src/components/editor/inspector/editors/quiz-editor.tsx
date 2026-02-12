'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input, Textarea } from '@/components/ui';
import type { QuizActivity } from '@/types/activities';

interface Props {
  activity: QuizActivity;
  onUpdate: (updates: Partial<QuizActivity>) => void;
}

export function QuizEditor({ activity, onUpdate }: Props) {
  const updateQuestion = (qIndex: number, updates: Record<string, unknown>) => {
    const questions = activity.questions.map((q, i) =>
      i === qIndex ? { ...q, ...updates } : q
    );
    onUpdate({ questions });
  };

  const updateOption = (qIndex: number, oIndex: number, updates: Record<string, unknown>) => {
    const questions = activity.questions.map((q, qi) => {
      if (qi !== qIndex) return q;
      const options = q.options.map((opt, oi) => {
        if (oi !== oIndex) {
          if (updates.correct) return { ...opt, correct: false };
          return opt;
        }
        return { ...opt, ...updates };
      });
      return { ...q, options };
    });
    onUpdate({ questions });
  };

  const addQuestion = () => {
    onUpdate({
      questions: [
        ...activity.questions,
        {
          id: `q-${Date.now()}`,
          text: '',
          points: 10,
          options: [
            { id: `o-${Date.now()}-1`, text: '', correct: true },
            { id: `o-${Date.now()}-2`, text: '', correct: false },
          ],
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    onUpdate({ questions: activity.questions.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="Quiz Title"
        value={activity.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Passing Score %"
          type="number"
          value={activity.passingScore}
          onChange={(e) => onUpdate({ passingScore: parseInt(e.target.value) || 0 })}
          min={0}
          max={100}
        />
        <Input
          label="Time Limit (sec)"
          type="number"
          value={activity.timeLimit}
          onChange={(e) => onUpdate({ timeLimit: parseInt(e.target.value) || 0 })}
          min={0}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          Questions ({activity.questions.length})
        </label>
        {activity.questions.map((q, qi) => (
          <div key={q.id} className="p-2 border border-border rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-muted">Q{qi + 1}</span>
              <button
                onClick={() => removeQuestion(qi)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <input
              type="text"
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              placeholder="Question text"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="space-y-1">
              {q.options.map((opt, oi) => (
                <div key={opt.id} className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={opt.correct}
                    onChange={() => updateOption(qi, oi, { correct: true })}
                    className="shrink-0"
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 text-xs px-2 py-0.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={addQuestion}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add question
        </button>
      </div>
    </div>
  );
}
