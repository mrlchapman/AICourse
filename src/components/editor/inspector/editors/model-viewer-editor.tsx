'use client';

import { Input } from '@/components/ui';
import type { ModelViewerActivity } from '@/types/activities';

interface Props {
  activity: ModelViewerActivity;
  onUpdate: (updates: Partial<ModelViewerActivity>) => void;
}

export function ModelViewerEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="3D Model title"
      />

      <Input
        label="Model URL"
        value={activity.modelUrl}
        onChange={(e) => onUpdate({ modelUrl: e.target.value })}
        placeholder="https://... (.glb, .gltf)"
        hint="Supports GLB, GLTF, OBJ, STL, FBX"
      />

      <Input
        label="Caption"
        value={activity.caption || ''}
        onChange={(e) => onUpdate({ caption: e.target.value })}
        placeholder="Optional caption"
      />

      <Input
        label="Poster Image"
        value={activity.poster || ''}
        onChange={(e) => onUpdate({ poster: e.target.value })}
        placeholder="Loading placeholder image URL"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={activity.backgroundColor || '#ffffff'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="w-8 h-8 rounded border border-border cursor-pointer"
          />
          <input
            type="text"
            value={activity.backgroundColor || '#ffffff'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="flex-1 text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Options</label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={activity.autoRotate ?? true}
            onChange={(e) => onUpdate({ autoRotate: e.target.checked })}
          />
          Auto rotate
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={activity.cameraControls ?? true}
            onChange={(e) => onUpdate({ cameraControls: e.target.checked })}
          />
          Camera controls
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={activity.ar ?? false}
            onChange={(e) => onUpdate({ ar: e.target.checked })}
          />
          AR mode
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={activity.required ?? false}
            onChange={(e) => onUpdate({ required: e.target.checked })}
          />
          Required
        </label>
      </div>
    </div>
  );
}
