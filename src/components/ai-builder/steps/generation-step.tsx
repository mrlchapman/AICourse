'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type {
  CourseOutline,
  CourseContent,
  CourseSection,
  AIQuestionAnswer,
  SectionOutline,
} from '@/types/activities';

interface GenerationStepProps {
  mode: 'quick' | 'progressive';
  title: string;
  sourceText: string;
  model: string;
  apiKey: string;
  outline: CourseOutline | null;
  userAnswers: AIQuestionAnswer[];
  onComplete: (content: CourseContent) => void | Promise<void>;
  onError: (error: string) => void;
}

type SectionStatus = 'pending' | 'generating' | 'complete' | 'error';

interface SectionProgress {
  id: string;
  title: string;
  status: SectionStatus;
  activityCount?: number;
  error?: string;
}

export function GenerationStep({
  mode,
  title,
  sourceText,
  model,
  apiKey,
  outline,
  userAnswers,
  onComplete,
  onError,
}: GenerationStepProps) {
  const [sectionProgress, setSectionProgress] = useState<SectionProgress[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [generatedSections, setGeneratedSections] = useState<CourseSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalActivities, setTotalActivities] = useState(0);
  const [description, setDescription] = useState('');
  const [finalContent, setFinalContent] = useState<CourseContent | null>(null);
  const hasStarted = useRef(false);

  const startGeneration = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    setIsGenerating(true);

    if (mode === 'quick') {
      await runQuickBuild();
    } else {
      await runProgressiveBuild();
    }
  }, [mode]);

  useEffect(() => {
    startGeneration();
  }, [startGeneration]);

  const runQuickBuild = async () => {
    setSectionProgress([
      { id: 'quick', title: 'Generating complete course...', status: 'generating' },
    ]);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_course',
          text: sourceText,
          title,
          model,
          apiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const actCount = data.course.sections.reduce(
        (acc: number, s: CourseSection) => acc + s.activities.length,
        0
      );
      setSectionProgress([
        {
          id: 'quick',
          title: 'Course generated!',
          status: 'complete',
          activityCount: actCount,
        },
      ]);
      setTotalActivities(actCount);
      setGeneratedSections(data.course.sections);
      setFinalContent(data.course);
      setIsGenerating(false);
    } catch (err: any) {
      setSectionProgress([
        { id: 'quick', title: 'Generation failed', status: 'error', error: err.message },
      ]);
      setIsGenerating(false);
      onError(err.message);
    }
  };

  const runProgressiveBuild = async () => {
    if (!outline) {
      onError('No outline available for progressive generation');
      return;
    }

    // Initialize progress
    const progress: SectionProgress[] = outline.sections.map((s) => ({
      id: s.id,
      title: s.title,
      status: 'pending' as SectionStatus,
    }));
    setSectionProgress(progress);
    setDescription(outline.description);

    const sections: CourseSection[] = [];
    const usedGameTypes: string[] = [];
    let activityTotal = 0;

    for (let i = 0; i < outline.sections.length; i++) {
      setCurrentSectionIndex(i);

      // Update status to generating
      setSectionProgress((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: 'generating' } : p))
      );

      try {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_section',
            model,
            apiKey,
            sectionOutline: outline.sections[i],
            sectionIndex: i,
            context: {
              courseTitle: title,
              courseDescription: outline.description,
              previousSectionTitles: sections.map((s) => s.title),
              userAnswers,
              originalText: sourceText,
              usedGameTypes,
            },
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        const section = data.section;
        sections.push(section);
        setGeneratedSections([...sections]);

        // Track used game types
        section.activities?.forEach((act: any) => {
          if (act.type === 'gamification' && act.gameType) {
            usedGameTypes.push(act.gameType);
          }
        });

        const sectionActivityCount = section.activities?.length || 0;
        activityTotal += sectionActivityCount;
        setTotalActivities(activityTotal);

        // Update status to complete
        setSectionProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'complete', activityCount: sectionActivityCount } : p
          )
        );
      } catch (err: any) {
        // Mark this section as error but continue
        setSectionProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error', error: err.message } : p
          )
        );
      }
    }

    setIsGenerating(false);

    if (sections.length > 0) {
      const content: CourseContent = {
        title,
        description: outline.description,
        sections,
      };
      setFinalContent(content);
    } else {
      onError('Failed to generate any sections');
    }
  };

  const completedCount = sectionProgress.filter((s) => s.status === 'complete').length;
  const totalCount = sectionProgress.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          {isGenerating ? 'Generating Your Course...' : 'Course Generated!'}
        </h2>
        <p className="text-sm text-foreground-muted">
          {isGenerating
            ? mode === 'progressive'
              ? `Building section ${currentSectionIndex + 1} of ${totalCount}...`
              : 'Creating your complete course with AI...'
            : `${totalActivities} activities across ${completedCount} sections`}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          <span>
            {completedCount} / {totalCount} sections
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Section List */}
      <div className="space-y-2">
        {sectionProgress.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors',
              section.status === 'generating'
                ? 'border-primary/30 bg-primary/5'
                : section.status === 'complete'
                  ? 'border-green-200 bg-green-50'
                  : section.status === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-border bg-white'
            )}
          >
            {/* Status Icon */}
            {section.status === 'pending' && (
              <Circle className="h-5 w-5 text-foreground-subtle shrink-0" />
            )}
            {section.status === 'generating' && (
              <Loader2 className="h-5 w-5 text-primary shrink-0 animate-spin" />
            )}
            {section.status === 'complete' && (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            )}
            {section.status === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-medium truncate',
                  section.status === 'generating'
                    ? 'text-primary'
                    : section.status === 'complete'
                      ? 'text-green-700'
                      : section.status === 'error'
                        ? 'text-red-700'
                        : 'text-foreground-muted'
                )}
              >
                {section.title}
              </p>
              {section.error && (
                <p className="text-xs text-red-500 mt-0.5">{section.error}</p>
              )}
            </div>

            {section.activityCount !== undefined && (
              <span className="text-xs text-foreground-subtle shrink-0">
                {section.activityCount} activities
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Live Preview Summary */}
      {generatedSections.length > 0 && (
        <div className="p-4 rounded-lg border border-border bg-white">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
          </div>
          <div className="space-y-2">
            {generatedSections.map((section, i) => (
              <div key={section.id} className="flex items-center gap-2 text-sm">
                <span className="text-xs font-medium text-foreground-subtle bg-surface-hover px-1.5 py-0.5 rounded">
                  {i + 1}
                </span>
                <span className="text-foreground">{section.title}</span>
                <span className="text-foreground-subtle">
                  ({section.activities.length} activities)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open in Editor Button */}
      {finalContent && !isGenerating && (
        <Button
          onClick={async () => {
            setIsSaving(true);
            try {
              await onComplete(finalContent);
            } catch (err: any) {
              onError(err.message || 'Failed to save course');
              setIsSaving(false);
            }
          }}
          loading={isSaving}
          className="w-full"
          size="lg"
        >
          {isSaving ? (
            'Saving course...'
          ) : (
            <>
              Open in Editor
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
