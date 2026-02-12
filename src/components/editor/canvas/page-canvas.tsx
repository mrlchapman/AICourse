'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityBlock } from './activity-block';
import { InsertMenu } from '../insert-menu/insert-menu';
import type { CourseSection, Activity } from '@/types/activities';

interface PageCanvasProps {
  section: CourseSection | null;
  selectedActivityId: string | null;
  onSelectActivity: (activityId: string) => void;
  onAddActivity: (activity: Activity, insertIndex?: number) => void;
  onReorderActivities: (oldIndex: number, newIndex: number) => void;
  onAddSection: (title?: string) => void;
}

export function PageCanvas({
  section,
  selectedActivityId,
  onSelectActivity,
  onAddActivity,
  onReorderActivities,
  onAddSection,
}: PageCanvasProps) {
  if (!section) {
    return (
      <div className="flex-1 overflow-y-auto bg-background-secondary">
        <div className="max-w-3xl mx-auto py-16 px-6">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border mb-4">
              <Plus className="h-8 w-8 text-foreground-subtle" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Start building your course
            </h2>
            <p className="text-sm text-foreground-muted mt-1 mb-6">
              Add a section from the sidebar, then add activities to it
            </p>
            <button
              onClick={() => onAddSection()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add First Section
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background-secondary">
      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
          <p className="text-sm text-foreground-muted mt-1">
            {section.activities.length} {section.activities.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>

        {/* Activities */}
        <div className="space-y-0">
          {section.activities.map((activity, index) => (
            <div key={activity.id}>
              {/* Insert between menu */}
              {index === 0 && (
                <InsertMenu
                  onInsert={(a) => onAddActivity(a, 0)}
                  position="between"
                />
              )}

              <ActivityBlock
                activity={activity}
                isSelected={activity.id === selectedActivityId}
                onClick={() => onSelectActivity(activity.id)}
              />

              <InsertMenu
                onInsert={(a) => onAddActivity(a, index + 1)}
                position="between"
              />
            </div>
          ))}

          {/* Add first activity */}
          {section.activities.length === 0 && (
            <InsertMenu
              onInsert={(a) => onAddActivity(a)}
              position="bottom"
            />
          )}
        </div>
      </div>
    </div>
  );
}
