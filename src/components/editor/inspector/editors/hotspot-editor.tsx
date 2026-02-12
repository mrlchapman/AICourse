'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui';
import type { HotspotActivity } from '@/types/activities';

interface Props {
  activity: HotspotActivity;
  onUpdate: (updates: Partial<HotspotActivity>) => void;
}

export function HotspotEditor({ activity, onUpdate }: Props) {
  const updateHotspot = (index: number, updates: Record<string, unknown>) => {
    const hotspots = activity.hotspots.map((h, i) =>
      i === index ? { ...h, ...updates } : h
    );
    onUpdate({ hotspots });
  };

  const addHotspot = () => {
    onUpdate({
      hotspots: [
        ...activity.hotspots,
        {
          id: `hs-${Date.now()}`,
          x: 50,
          y: 50,
          title: '',
          content: '',
        },
      ],
    });
  };

  const removeHotspot = (index: number) => {
    onUpdate({ hotspots: activity.hotspots.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="Image URL"
        value={activity.imageUrl}
        onChange={(e) => onUpdate({ imageUrl: e.target.value })}
        placeholder="https://..."
      />

      {activity.imageUrl && (
        <div className="relative rounded-md overflow-hidden border border-border">
          <img
            src={activity.imageUrl}
            alt="Hotspot base"
            className="w-full h-auto"
          />
          {activity.hotspots.map((hs, i) => (
            <div
              key={hs.id}
              className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow"
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Hotspots ({activity.hotspots.length})
        </label>
        {activity.hotspots.map((hs, i) => (
          <div key={hs.id} className="p-2 border border-border rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">Spot {i + 1}</span>
              <button
                onClick={() => removeHotspot(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <input
              type="text"
              value={hs.title}
              onChange={(e) => updateHotspot(i, { title: e.target.value })}
              placeholder="Hotspot title"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <textarea
              value={hs.content}
              onChange={(e) => updateHotspot(i, { content: e.target.value })}
              placeholder="Content shown on click..."
              rows={2}
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
            />
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="text-[10px] text-foreground-muted">X %</label>
                <input
                  type="number"
                  value={hs.x}
                  onChange={(e) => updateHotspot(i, { x: parseFloat(e.target.value) || 0 })}
                  min={0}
                  max={100}
                  className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[10px] text-foreground-muted">Y %</label>
                <input
                  type="number"
                  value={hs.y}
                  onChange={(e) => updateHotspot(i, { y: parseFloat(e.target.value) || 0 })}
                  min={0}
                  max={100}
                  className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addHotspot}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add hotspot
        </button>
      </div>
    </div>
  );
}
