'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Trash2, Sparkles, Copy, Loader2, PanelRightClose, PanelRightOpen, Maximize2 } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { getActivityDisplayInfo, ACTIVITY_CONFIG, type Activity, type CourseContent } from '@/types/activities';
import { TextContentEditor } from './editors/text-content-editor';
import { ImageEditor } from './editors/image-editor';
import { KnowledgeCheckEditor } from './editors/knowledge-check-editor';
import { YouTubeEditor } from './editors/youtube-editor';
import { InfoPanelEditor } from './editors/info-panel-editor';
import { QuizEditor } from './editors/quiz-editor';
import { AccordionEditor } from './editors/accordion-editor';
import { TabsEditor } from './editors/tabs-editor';
import { FlashcardEditor } from './editors/flashcard-editor';
import { MatchingEditor } from './editors/matching-editor';
import { SequenceEditor } from './editors/sequence-editor';
import { SortingEditor } from './editors/sorting-editor';
import { CodeSnippetEditor } from './editors/code-snippet-editor';
import { ProcessEditor } from './editors/process-editor';
import { TimelineEditor } from './editors/timeline-editor';
import { FillInBlankEditor } from './editors/fill-in-blank-editor';
import { HotspotEditor } from './editors/hotspot-editor';
import { InteractiveVideoEditor } from './editors/interactive-video-editor';
import { ButtonEditor } from './editors/button-editor';
import { AudioEditor } from './editors/audio-editor';
import { GalleryEditor } from './editors/gallery-editor';
import { DividerEditor } from './editors/divider-editor';
import { EmbedEditor } from './editors/embed-editor';
import { PDFEditor } from './editors/pdf-editor';
import { VideoEditor } from './editors/video-editor';
import { InfographicEditor } from './editors/infographic-editor';
import { DocumentViewerEditor } from './editors/document-viewer-editor';
import { ModelViewerEditor } from './editors/model-viewer-editor';
import { ScreenRecordingEditor } from './editors/screen-recording-editor';
import { GamificationEditor } from './editors/gamification-editor';
import { BranchingScenarioEditor } from './editors/branching-scenario-editor';
import { LiveEditor } from './editors/live-editor';
import { DiscussionEditor } from './editors/discussion-editor';
import { GenericEditor } from './editors/generic-editor';

interface InspectorPanelProps {
  activity: Activity;
  sectionId: string;
  courseContent?: CourseContent;
  onUpdate: (updates: Partial<Activity>) => void;
  onDelete: () => void;
  onClose: () => void;
}

// Activity types that support AI generation
const AI_GENERATABLE_TYPES = [
  'knowledge_check',
  'quiz',
  'flashcard',
  'matching',
  'sequence',
  'sorting',
  'fill_in_blank',
  'gamification',
  'accordion',
  'tabs',
  'timeline',
  'process',
  'info_panel',
  'text_content',
  'discussion',
];

const MIN_WIDTH = 288;
const DEFAULT_WIDTH = 320;
const MAX_WIDTH = 640;

export function InspectorPanel({ activity, sectionId, courseContent, onUpdate, onDelete, onClose }: InspectorPanelProps) {
  const { icon, label } = getActivityDisplayInfo(activity);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [aiTopic, setAiTopic] = useState('');
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
      setPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const canGenerate = AI_GENERATABLE_TYPES.includes(activity.type);

  const handleAIGenerate = async () => {
    setGenerating(true);
    setGenError(null);

    try {
      // Build context from course content
      const section = courseContent?.sections.find((s) => s.id === sectionId);
      const courseContext = [
        courseContent?.title ? `Course: ${courseContent.title}` : '',
        courseContent?.description ? `Description: ${courseContent.description}` : '',
        section?.title ? `Section: ${section.title}` : '',
      ].filter(Boolean).join('\n');

      const topicContext = aiTopic.trim()
        ? `Topic: ${aiTopic.trim()}\n${courseContext}`
        : courseContext || 'Generate content for a learning activity';

      const body: Record<string, unknown> = {
        action: 'generate_activity',
        text: topicContext,
        activityType: activity.type,
      };

      // For gamification, include the subType
      if (activity.type === 'gamification') {
        body.subType = (activity as any).gameType;
      }

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();
      if (data.activity) {
        // Preserve the current ID, type, and order
        const { id, type, order, editorLabel, ...generated } = data.activity;
        onUpdate(generated);
      }
    } catch (e: any) {
      setGenError(e.message || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      className="border-l border-border bg-surface overflow-y-auto shrink-0 flex flex-col relative"
      style={{ width: panelWidth }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors z-10"
      />
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">{icon}</span>
          <span className="text-sm font-semibold text-foreground truncate">{label}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setPanelWidth(MIN_WIDTH)}
            title="Narrow"
            className={`p-1 rounded-md transition-colors ${panelWidth <= MIN_WIDTH ? 'text-primary bg-primary/10' : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'}`}
          >
            <PanelRightClose className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setPanelWidth(MAX_WIDTH)}
            title="Wide"
            className={`p-1 rounded-md transition-colors ${panelWidth >= MAX_WIDTH ? 'text-primary bg-primary/10' : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'}`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Custom Label */}
      <div className="px-3 pt-3">
        <Input
          label="Display Label"
          value={activity.editorLabel || ''}
          onChange={(e) => onUpdate({ editorLabel: e.target.value || undefined })}
          placeholder={ACTIVITY_CONFIG[activity.type]?.label || 'Label'}
          hint="Override the default label in the outline"
        />
      </div>

      {/* Activity-specific editor */}
      <div className="flex-1 px-3 py-3">
        <ActivityEditor activity={activity} onUpdate={onUpdate} />
      </div>

      {/* AI Generation Error */}
      {genError && (
        <div className="px-3 pb-2">
          <p className="text-xs text-danger bg-danger-light rounded-md px-2 py-1.5">{genError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-3 border-t border-border space-y-2">
        {canGenerate && (
          <div className="flex items-end gap-1.5">
            <div className="flex-1 min-w-0">
              <Input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Topic, e.g. photosynthesis"
                className="text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !generating) handleAIGenerate();
                }}
                label="AI Topic"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 px-2 h-10"
              onClick={handleAIGenerate}
              disabled={generating}
              title="AI Generate"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Copy className="h-4 w-4" />
          Duplicate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-danger hover:bg-danger-light hover:text-danger"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}

function ActivityEditor({ activity, onUpdate }: { activity: Activity; onUpdate: (updates: Partial<Activity>) => void }) {
  switch (activity.type) {
    case 'text_content':
      return <TextContentEditor activity={activity} onUpdate={onUpdate} />;
    case 'image':
      return <ImageEditor activity={activity} onUpdate={onUpdate} />;
    case 'knowledge_check':
      return <KnowledgeCheckEditor activity={activity} onUpdate={onUpdate} />;
    case 'youtube':
      return <YouTubeEditor activity={activity} onUpdate={onUpdate} />;
    case 'info_panel':
      return <InfoPanelEditor activity={activity} onUpdate={onUpdate} />;
    case 'quiz':
      return <QuizEditor activity={activity} onUpdate={onUpdate} />;
    case 'accordion':
      return <AccordionEditor activity={activity} onUpdate={onUpdate} />;
    case 'tabs':
      return <TabsEditor activity={activity} onUpdate={onUpdate} />;
    case 'flashcard':
      return <FlashcardEditor activity={activity} onUpdate={onUpdate} />;
    case 'matching':
      return <MatchingEditor activity={activity} onUpdate={onUpdate} />;
    case 'sequence':
      return <SequenceEditor activity={activity} onUpdate={onUpdate} />;
    case 'sorting':
      return <SortingEditor activity={activity} onUpdate={onUpdate} />;
    case 'code_snippet':
      return <CodeSnippetEditor activity={activity} onUpdate={onUpdate} />;
    case 'process':
      return <ProcessEditor activity={activity} onUpdate={onUpdate} />;
    case 'timeline':
      return <TimelineEditor activity={activity} onUpdate={onUpdate} />;
    case 'fill_in_blank':
      return <FillInBlankEditor activity={activity} onUpdate={onUpdate} />;
    case 'hotspot':
      return <HotspotEditor activity={activity} onUpdate={onUpdate} />;
    case 'interactive_video':
      return <InteractiveVideoEditor activity={activity} onUpdate={onUpdate} />;
    case 'button':
      return <ButtonEditor activity={activity} onUpdate={onUpdate} />;
    case 'audio':
      return <AudioEditor activity={activity} onUpdate={onUpdate} />;
    case 'gallery':
      return <GalleryEditor activity={activity} onUpdate={onUpdate} />;
    case 'divider':
      return <DividerEditor activity={activity} onUpdate={onUpdate} />;
    case 'embed':
      return <EmbedEditor activity={activity} onUpdate={onUpdate} />;
    case 'pdf':
      return <PDFEditor activity={activity} onUpdate={onUpdate} />;
    case 'video':
      return <VideoEditor activity={activity} onUpdate={onUpdate} />;
    case 'infographic':
      return <InfographicEditor activity={activity} onUpdate={onUpdate} />;
    case 'document_viewer':
      return <DocumentViewerEditor activity={activity} onUpdate={onUpdate} />;
    case 'model_viewer':
      return <ModelViewerEditor activity={activity} onUpdate={onUpdate} />;
    case 'screen_recording':
      return <ScreenRecordingEditor activity={activity} onUpdate={onUpdate} />;
    case 'gamification':
      return <GamificationEditor activity={activity} onUpdate={onUpdate} />;
    case 'branching_scenario':
      return <BranchingScenarioEditor activity={activity} onUpdate={onUpdate} />;
    case 'live':
      return <LiveEditor activity={activity} onUpdate={onUpdate} />;
    case 'discussion':
      return <DiscussionEditor activity={activity} onUpdate={onUpdate} />;
    default:
      return <GenericEditor activity={activity} onUpdate={onUpdate} />;
  }
}
