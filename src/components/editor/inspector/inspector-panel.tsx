'use client';

import { X, Trash2, Sparkles, Copy } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { getActivityDisplayInfo, ACTIVITY_CONFIG, type Activity } from '@/types/activities';
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
import { GenericEditor } from './editors/generic-editor';

interface InspectorPanelProps {
  activity: Activity;
  sectionId: string;
  onUpdate: (updates: Partial<Activity>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function InspectorPanel({ activity, sectionId, onUpdate, onDelete, onClose }: InspectorPanelProps) {
  const { icon, label } = getActivityDisplayInfo(activity);

  return (
    <div className="w-72 border-l border-border bg-surface overflow-y-auto shrink-0 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">{icon}</span>
          <span className="text-sm font-semibold text-foreground truncate">{label}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
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

      {/* Actions */}
      <div className="p-3 border-t border-border space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Sparkles className="h-4 w-4" />
          AI Regenerate
        </Button>
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
    default:
      return <GenericEditor activity={activity} onUpdate={onUpdate} />;
  }
}
