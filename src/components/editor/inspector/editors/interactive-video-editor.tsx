'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui';
import type { InteractiveVideoActivity, VideoCheckpoint } from '@/types/activities';

interface Props {
  activity: InteractiveVideoActivity;
  onUpdate: (updates: Partial<InteractiveVideoActivity>) => void;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function parseTimestamp(str: string): number {
  const parts = str.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return parseInt(str) || 0;
}

export function InteractiveVideoEditor({ activity, onUpdate }: Props) {
  const updateCheckpoint = (index: number, updates: Partial<VideoCheckpoint>) => {
    const checkpoints = activity.checkpoints.map((cp, i) =>
      i === index ? { ...cp, ...updates } : cp
    );
    onUpdate({ checkpoints });
  };

  const updateCheckpointOption = (cpIndex: number, optIndex: number, updates: Record<string, unknown>) => {
    const cp = activity.checkpoints[cpIndex];
    if (!cp.options) return;
    const options = cp.options.map((opt, i) => {
      if (i !== optIndex) {
        if (updates.correct) return { ...opt, correct: false };
        return opt;
      }
      return { ...opt, ...updates };
    });
    updateCheckpoint(cpIndex, { options });
  };

  const addCheckpoint = (type: 'explanation' | 'knowledge_check') => {
    const newCp: VideoCheckpoint = {
      id: `cp-${Date.now()}`,
      timestamp: 0,
      type,
      ...(type === 'explanation'
        ? { title: '', content: '' }
        : {
            question: '',
            options: [
              { id: `o-${Date.now()}-1`, text: '', correct: true },
              { id: `o-${Date.now()}-2`, text: '', correct: false },
            ],
            explanation: '',
          }),
    };
    onUpdate({
      checkpoints: [...activity.checkpoints, newCp].sort((a, b) => a.timestamp - b.timestamp),
    });
  };

  const removeCheckpoint = (index: number) => {
    onUpdate({ checkpoints: activity.checkpoints.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="YouTube Video ID"
        value={activity.videoId}
        onChange={(e) => onUpdate({ videoId: e.target.value })}
        placeholder="dQw4w9WgXcQ"
      />

      <Input
        label="Caption"
        value={activity.caption || ''}
        onChange={(e) => onUpdate({ caption: e.target.value })}
        placeholder="Optional caption"
      />

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={activity.preventSkipping ?? false}
          onChange={(e) => onUpdate({ preventSkipping: e.target.checked })}
        />
        Prevent skipping checkpoints
      </label>

      {/* Checkpoints */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Checkpoints ({activity.checkpoints.length})
        </label>
        {activity.checkpoints.map((cp, i) => (
          <div key={cp.id} className="p-2 border border-border rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">
                {cp.type === 'explanation' ? 'Info' : 'Question'} @ {formatTimestamp(cp.timestamp)}
              </span>
              <button
                onClick={() => removeCheckpoint(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <input
              type="text"
              value={formatTimestamp(cp.timestamp)}
              onChange={(e) => updateCheckpoint(i, { timestamp: parseTimestamp(e.target.value) })}
              placeholder="0:00"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />

            {cp.type === 'explanation' ? (
              <>
                <input
                  type="text"
                  value={cp.title || ''}
                  onChange={(e) => updateCheckpoint(i, { title: e.target.value })}
                  placeholder="Title"
                  className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                />
                <textarea
                  value={cp.content || ''}
                  onChange={(e) => updateCheckpoint(i, { content: e.target.value })}
                  placeholder="Explanation content..."
                  rows={2}
                  className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={cp.question || ''}
                  onChange={(e) => updateCheckpoint(i, { question: e.target.value })}
                  placeholder="Question"
                  className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="space-y-1">
                  {cp.options?.map((opt, oi) => (
                    <div key={opt.id} className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={opt.correct}
                        onChange={() => updateCheckpointOption(i, oi, { correct: true })}
                        className="shrink-0"
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateCheckpointOption(i, oi, { text: e.target.value })}
                        placeholder={`Option ${oi + 1}`}
                        className="flex-1 text-xs px-2 py-0.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  value={cp.explanation || ''}
                  onChange={(e) => updateCheckpoint(i, { explanation: e.target.value })}
                  placeholder="Explanation after answer"
                  className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button
            onClick={() => addCheckpoint('explanation')}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Info point
          </button>
          <button
            onClick={() => addCheckpoint('knowledge_check')}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Question
          </button>
        </div>
      </div>
    </div>
  );
}
