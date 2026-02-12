'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { FlashcardActivity } from '@/types/activities';

interface Props {
  activity: FlashcardActivity;
  onUpdate: (updates: Partial<FlashcardActivity>) => void;
}

export function FlashcardEditor({ activity, onUpdate }: Props) {
  const updateCard = (index: number, updates: Record<string, string>) => {
    const cards = (activity.cards || []).map((c, i) =>
      i === index ? { ...c, ...updates } : c
    );
    onUpdate({ cards });
  };

  const addCard = () => {
    onUpdate({
      cards: [
        ...(activity.cards || []),
        { id: `card-${Date.now()}`, front: '', back: '' },
      ],
    });
  };

  const removeCard = (index: number) => {
    onUpdate({ cards: (activity.cards || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Cards ({(activity.cards || []).length})
      </label>
      {(activity.cards || []).map((card, i) => (
        <div key={card.id} className="p-2 border border-border rounded-md space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-muted">Card {i + 1}</span>
            {(activity.cards || []).length > 1 && (
              <button
                onClick={() => removeCard(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
          <input
            type="text"
            value={card.front}
            onChange={(e) => updateCard(i, { front: e.target.value })}
            placeholder="Front (term)"
            className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="text"
            value={card.back}
            onChange={(e) => updateCard(i, { back: e.target.value })}
            placeholder="Back (definition)"
            className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      ))}
      <button
        onClick={addCard}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Plus className="h-3 w-3" /> Add card
      </button>
    </div>
  );
}
