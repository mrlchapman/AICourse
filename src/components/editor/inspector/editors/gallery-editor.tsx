'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui';
import type { GalleryActivity } from '@/types/activities';

interface Props {
  activity: GalleryActivity;
  onUpdate: (updates: Partial<GalleryActivity>) => void;
}

export function GalleryEditor({ activity, onUpdate }: Props) {
  const updateImage = (index: number, updates: Record<string, string>) => {
    const images = (activity.images || []).map((img, i) =>
      i === index ? { ...img, ...updates } : img
    );
    onUpdate({ images });
  };

  const addImage = () => {
    onUpdate({
      images: [
        ...(activity.images || []),
        { id: `img-${Date.now()}`, src: '', alt: '', caption: '' },
      ],
    });
  };

  const removeImage = (index: number) => {
    onUpdate({ images: (activity.images || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Gallery title"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Layout</label>
        <select
          value={activity.layout || 'carousel'}
          onChange={(e) => onUpdate({ layout: e.target.value as 'carousel' | 'grid' })}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="carousel">Carousel</option>
          <option value="grid">Grid</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Images ({(activity.images || []).length})
        </label>
        {(activity.images || []).map((img, i) => (
          <div key={img.id} className="p-2 border border-border rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-muted">Image {i + 1}</span>
              <button
                onClick={() => removeImage(i)}
                className="p-0.5 text-foreground-subtle hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            {img.src && (
              <img src={img.src} alt={img.alt || ''} className="w-full h-20 object-cover rounded" />
            )}
            <input
              type="url"
              value={img.src}
              onChange={(e) => updateImage(i, { src: e.target.value })}
              placeholder="Image URL"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={img.alt || ''}
              onChange={(e) => updateImage(i, { alt: e.target.value })}
              placeholder="Alt text"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={img.caption || ''}
              onChange={(e) => updateImage(i, { caption: e.target.value })}
              placeholder="Caption (optional)"
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
        <button
          onClick={addImage}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add image
        </button>
      </div>
    </div>
  );
}
