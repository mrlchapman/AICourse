'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Eye,
  Download,
  Save,
  MoreHorizontal,
  Palette,
  X,
  PanelLeftClose,
  PanelLeft,
  Undo2,
  Redo2,
} from 'lucide-react';
import Link from 'next/link';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui';
import { OutlineSidebar } from './outline/outline-sidebar';
import { PageCanvas } from './canvas/page-canvas';
import { InspectorPanel } from './inspector/inspector-panel';
import { PreviewModal } from './preview/preview-modal';
import { ThemeModal } from './theme/theme-modal';
import { updateCourseContent } from '@/app/actions/courses';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { buildScormCourse } from '@/lib/scorm/courseBuilder';
import JSZip from 'jszip';
import type { CourseContent, CourseSection, Activity, CourseThemeConfig } from '@/types/activities';

interface EditorShellProps {
  courseId: string;
  initialContent?: CourseContent;
}

const DEFAULT_CONTENT: CourseContent = {
  title: 'Untitled Course',
  description: '',
  sections: [],
};

export function EditorShell({ courseId, initialContent }: EditorShellProps) {
  const { content, setContent, undo, redo, canUndo, canRedo } = useUndoRedo(initialContent || DEFAULT_CONTENT);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    initialContent?.sections?.[0]?.id ?? null
  );
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showOutline, setShowOutline] = useState(true);

  const selectedSection = content.sections.find((s) => s.id === selectedSectionId) || null;
  const selectedActivity = selectedSection?.activities.find((a) => a.id === selectedActivityId) || null;

  // Save handler
  const savingRef = useRef(false);
  const handleSave = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    await updateCourseContent(courseId, content);
    setSaving(false);
    savingRef.current = false;
  }, [courseId, content]);

  // SCORM export handler
  const [exporting, setExporting] = useState(false);
  const handleExportScorm = useCallback(async () => {
    setExporting(true);
    try {
      const files = buildScormCourse(content);
      const zip = new JSZip();
      for (const [filename, fileContent] of Object.entries(files)) {
        zip.file(filename, fileContent);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.title || 'course'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SCORM export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [content]);

  // Keyboard shortcuts: Cmd+S, Cmd+Z, Cmd+Shift+Z
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave, undo, redo]);

  // Section management
  const addSection = useCallback((title: string = 'New Section') => {
    const newSection: CourseSection = {
      id: `section-${nanoid(8)}`,
      title,
      order: content.sections.length,
      activities: [],
    };
    setContent((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setSelectedSectionId(newSection.id);
    setSelectedActivityId(null);
  }, [content.sections.length]);

  const updateSection = useCallback((sectionId: string, updates: Partial<CourseSection>) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections
        .filter((s) => s.id !== sectionId)
        .map((s, i) => ({ ...s, order: i })),
    }));
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
      setSelectedActivityId(null);
    }
  }, [selectedSectionId]);

  const reorderSections = useCallback((oldIndex: number, newIndex: number) => {
    setContent((prev) => {
      const sections = [...prev.sections];
      const [moved] = sections.splice(oldIndex, 1);
      sections.splice(newIndex, 0, moved);
      return {
        ...prev,
        sections: sections.map((s, i) => ({ ...s, order: i })),
      };
    });
  }, []);

  // Activity management
  const addActivity = useCallback((sectionId: string, activity: Activity, insertIndex?: number) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const activities = [...s.activities];
        if (insertIndex !== undefined) {
          activities.splice(insertIndex, 0, activity);
        } else {
          activities.push(activity);
        }
        return {
          ...s,
          activities: activities.map((a, i) => ({ ...a, order: i })),
        };
      }),
    }));
    setSelectedActivityId(activity.id);
  }, []);

  const updateActivity = useCallback((sectionId: string, activityId: string, updates: Partial<Activity>) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          activities: s.activities.map((a) =>
            a.id === activityId ? ({ ...a, ...updates } as Activity) : a
          ),
        };
      }),
    }));
  }, []);

  const deleteActivity = useCallback((sectionId: string, activityId: string) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          activities: s.activities
            .filter((a) => a.id !== activityId)
            .map((a, i) => ({ ...a, order: i })),
        };
      }),
    }));
    if (selectedActivityId === activityId) {
      setSelectedActivityId(null);
    }
  }, [selectedActivityId]);

  const reorderActivities = useCallback((sectionId: string, oldIndex: number, newIndex: number) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const activities = [...s.activities];
        const [moved] = activities.splice(oldIndex, 1);
        activities.splice(newIndex, 0, moved);
        return {
          ...s,
          activities: activities.map((a, i) => ({ ...a, order: i })),
        };
      }),
    }));
  }, []);

  const duplicateActivity = useCallback(() => {
    if (!selectedSectionId || !selectedActivity) return;
    const cloned = JSON.parse(JSON.stringify(selectedActivity)) as Activity;
    cloned.id = `activity-${nanoid(8)}`;
    const insertIndex = selectedActivity.order + 1;
    addActivity(selectedSectionId, cloned, insertIndex);
  }, [selectedSectionId, selectedActivity, addActivity]);

  const updateCourseTitle = useCallback((title: string) => {
    setContent((prev) => ({ ...prev, title }));
  }, []);

  const updateTheme = useCallback((theme: CourseThemeConfig) => {
    setContent((prev) => ({ ...prev, theme }));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="h-12 border-b border-border bg-surface flex items-center px-4 gap-3 shrink-0 z-10">
        <Link
          href="/courses"
          className="flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="h-5 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon-sm"
          title={showOutline ? 'Hide outline' : 'Show outline'}
          onClick={() => setShowOutline((v) => !v)}
        >
          {showOutline ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </Button>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Undo (⌘Z)"
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Redo (⌘⇧Z)"
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-5 w-px bg-border" />

        <input
          type="text"
          value={content.title}
          onChange={(e) => updateCourseTitle(e.target.value)}
          className="text-sm font-semibold text-foreground bg-transparent border-none outline-none flex-1 min-w-0 hover:bg-surface-hover focus:bg-surface-hover px-2 py-1 rounded-md transition-colors"
          placeholder="Course title..."
        />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" title="Theme" onClick={() => setShowTheme(true)}>
            <Palette className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Preview" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Export SCORM" loading={exporting} onClick={handleExportScorm}>
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Save (⌘S)"
            loading={saving}
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Outline Sidebar */}
        {showOutline && <OutlineSidebar
          sections={content.sections}
          selectedSectionId={selectedSectionId}
          selectedActivityId={selectedActivityId}
          onSelectSection={(id) => {
            setSelectedSectionId(id);
            setSelectedActivityId(null);
          }}
          onSelectActivity={(sectionId, activityId) => {
            setSelectedSectionId(sectionId);
            setSelectedActivityId(activityId);
          }}
          onAddSection={addSection}
          onDeleteSection={deleteSection}
          onUpdateSection={updateSection}
          onReorderSections={reorderSections}
        />}

        {/* Page Canvas */}
        <PageCanvas
          section={selectedSection}
          selectedActivityId={selectedActivityId}
          onSelectActivity={(activityId) => setSelectedActivityId(activityId)}
          onAddActivity={(activity, insertIndex) => {
            if (selectedSectionId) {
              addActivity(selectedSectionId, activity, insertIndex);
            }
          }}
          onReorderActivities={(oldIndex, newIndex) => {
            if (selectedSectionId) {
              reorderActivities(selectedSectionId, oldIndex, newIndex);
            }
          }}
          onAddSection={addSection}
        />

        {/* Inspector Panel */}
        {selectedActivity && selectedSectionId && (
          <InspectorPanel
            activity={selectedActivity}
            sectionId={selectedSectionId}
            courseContent={content}
            onUpdate={(updates) => {
              if (selectedSectionId && selectedActivityId) {
                updateActivity(selectedSectionId, selectedActivityId, updates);
              }
            }}
            onDelete={() => {
              if (selectedSectionId && selectedActivityId) {
                deleteActivity(selectedSectionId, selectedActivityId);
              }
            }}
            onDuplicate={duplicateActivity}
            onClose={() => setSelectedActivityId(null)}
          />
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          courseContent={content}
          onUpdateTheme={updateTheme}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Theme Modal */}
      {showTheme && (
        <ThemeModal
          theme={content.theme}
          onUpdate={updateTheme}
          onClose={() => setShowTheme(false)}
        />
      )}
    </div>
  );
}
