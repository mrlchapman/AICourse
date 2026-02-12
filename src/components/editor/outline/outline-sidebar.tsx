'use client';

import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getActivityDisplayInfo, type CourseSection, type Activity } from '@/types/activities';

interface OutlineSidebarProps {
  sections: CourseSection[];
  selectedSectionId: string | null;
  selectedActivityId: string | null;
  onSelectSection: (id: string) => void;
  onSelectActivity: (sectionId: string, activityId: string) => void;
  onAddSection: (title?: string) => void;
  onDeleteSection: (id: string) => void;
  onUpdateSection: (id: string, updates: Partial<CourseSection>) => void;
  onReorderSections: (oldIndex: number, newIndex: number) => void;
}

export function OutlineSidebar({
  sections,
  selectedSectionId,
  selectedActivityId,
  onSelectSection,
  onSelectActivity,
  onAddSection,
  onDeleteSection,
  onUpdateSection,
}: OutlineSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const toggleExpand = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  return (
    <div className="w-56 border-r border-border bg-surface overflow-y-auto shrink-0 flex flex-col">
      <div className="p-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider">
          Outline
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(section.id);
          const isSelected = section.id === selectedSectionId;
          const isEditing = editingSectionId === section.id;

          return (
            <div key={`${section.id}-${sectionIndex}`}>
              {/* Section header */}
              <div
                className={cn(
                  'group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm',
                  isSelected && !selectedActivityId
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-foreground hover:bg-surface-hover'
                )}
                onClick={() => {
                  onSelectSection(section.id);
                  if (!isExpanded) toggleExpand(section.id);
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(section.id);
                  }}
                  className="shrink-0 p-0.5 rounded hover:bg-surface-active transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>

                {isEditing ? (
                  <input
                    autoFocus
                    className="flex-1 bg-surface border border-border rounded px-1.5 py-0.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={section.title}
                    onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
                    onBlur={() => setEditingSectionId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingSectionId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="flex-1 truncate"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingSectionId(section.id);
                    }}
                  >
                    {section.title}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSectionId(section.id);
                  }}
                  className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-surface-active transition-all"
                  title="Rename section"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(section.id);
                  }}
                  className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-danger-light hover:text-danger transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {/* Activities list */}
              {isExpanded && (
                <div className="ml-4 pl-2 border-l border-border/50 space-y-0.5 my-0.5">
                  {section.activities.map((activity, activityIndex) => {
                    const { icon, label } = getActivityDisplayInfo(activity);
                    const isActivitySelected = activity.id === selectedActivityId;

                    return (
                      <div
                        key={`${activity.id}-${activityIndex}`}
                        onClick={() => onSelectActivity(section.id, activity.id)}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors text-xs',
                          isActivitySelected
                            ? 'bg-primary-light text-primary font-medium'
                            : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'
                        )}
                      >
                        <span className="shrink-0 text-sm">{icon}</span>
                        <span className="truncate">{label}</span>
                      </div>
                    );
                  })}
                  {section.activities.length === 0 && (
                    <p className="text-xs text-foreground-subtle px-2 py-1 italic">
                      No activities
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Section Button */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => onAddSection()}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-primary hover:bg-primary-light rounded-lg transition-colors font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Section
        </button>
      </div>
    </div>
  );
}
