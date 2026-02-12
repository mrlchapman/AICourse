/**
 * Activity Type Definitions
 * Ported from LeesDash - all 38+ activity types
 */

export type ActivityType =
  | 'knowledge_check'
  | 'flashcard'
  | 'matching'
  | 'hotspot'
  | 'sequence'
  | 'accordion'
  | 'code_snippet'
  | 'info_panel'
  | 'document_viewer'
  | 'pdf'
  | 'text_content'
  | 'image'
  | 'infographic'
  | 'video'
  | 'youtube'
  | 'interactive_video'
  | 'sorting'
  | 'process'
  | 'quiz'
  | 'gamification'
  | 'tabs'
  | 'timeline'
  | 'button'
  | 'audio'
  | 'gallery'
  | 'divider'
  | 'embed'
  | 'model_viewer'
  | 'branching_scenario'
  | 'screen_recording'
  | 'fill_in_blank'
  | 'live'
  | 'discussion';

export interface BaseActivity {
  id: string;
  type: ActivityType;
  order: number;
  editorLabel?: string;
  comments?: {
    author: string;
    text: string;
    timestamp: string;
  }[];
}

export interface TextContentActivity extends BaseActivity {
  type: 'text_content';
  content: string;
}

export interface ImageActivity extends BaseActivity {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  required?: boolean;
  geminiPrompt?: string;
}

export interface InfographicActivity extends BaseActivity {
  type: 'infographic';
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  required?: boolean;
  infographicPrompt: string;
}

export interface VideoActivity extends BaseActivity {
  type: 'video';
  src: string;
  caption?: string;
}

export interface YouTubeActivity extends BaseActivity {
  type: 'youtube';
  videoId: string;
  caption?: string;
  required?: boolean;
}

export interface VideoCheckpoint {
  id: string;
  timestamp: number;
  type: 'explanation' | 'knowledge_check';
  title?: string;
  content?: string;
  question?: string;
  options?: { id: string; text: string; correct: boolean }[];
  explanation?: string;
}

export interface InteractiveVideoActivity extends BaseActivity {
  type: 'interactive_video';
  videoId: string;
  caption?: string;
  checkpoints: VideoCheckpoint[];
  required?: boolean;
  preventSkipping?: boolean;
}

export interface KnowledgeCheckActivity extends BaseActivity {
  type: 'knowledge_check';
  question: string;
  options: { id: string; text: string; correct: boolean }[];
  explanation?: string;
}

export interface FlashcardActivity extends BaseActivity {
  type: 'flashcard';
  cards: {
    id: string;
    front: string;
    back: string;
    frontType?: 'text' | 'image';
    backType?: 'text' | 'image';
  }[];
}

export interface MatchingActivity extends BaseActivity {
  type: 'matching';
  title: string;
  pairs: { id: string; left: string; right: string }[];
}

export interface HotspotActivity extends BaseActivity {
  type: 'hotspot';
  imageUrl: string;
  hotspots: {
    id: string;
    x: number;
    y: number;
    title: string;
    content: string;
  }[];
}

export interface SequenceActivity extends BaseActivity {
  type: 'sequence';
  title: string;
  items: { id: string; text: string; order: number }[];
}

export interface AccordionActivity extends BaseActivity {
  type: 'accordion';
  required?: boolean;
  sections: { id: string; title: string; content: string }[];
}

export interface CodeSnippetActivity extends BaseActivity {
  type: 'code_snippet';
  language: string;
  code: string;
  title?: string;
}

export interface InfoPanelActivity extends BaseActivity {
  type: 'info_panel';
  title: string;
  content: string;
  variant: 'info' | 'warning' | 'success' | 'error';
}

export interface DocumentViewerActivity extends BaseActivity {
  type: 'document_viewer';
  documentUrl: string;
  title?: string;
}

export interface PDFActivity extends BaseActivity {
  type: 'pdf';
  pdfUrl: string;
  title?: string;
  driveFileId?: string;
  required?: boolean;
}

export interface SortingActivity extends BaseActivity {
  type: 'sorting';
  title: string;
  categories: { id: string; title: string }[];
  items: { id: string; text: string; categoryId: string }[];
}

export interface ProcessActivity extends BaseActivity {
  type: 'process';
  steps: { id: string; title: string; content: string }[];
}

export interface QuizActivity extends BaseActivity {
  type: 'quiz';
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: {
    id: string;
    text: string;
    points: number;
    options: { id: string; text: string; correct: boolean }[];
    feedback?: string;
    imageUrl?: string;
  }[];
}

export interface GamificationActivity extends BaseActivity {
  type: 'gamification';
  gameType: 'memory_match' | 'neon_defender' | 'knowledge_tetris' | 'quiz_uno' | 'word_search' | 'battleships' | 'millionaire' | 'the_chase';
  config: {
    required?: boolean;
    penaltyShuffle?: boolean;
    pairs?: {
      id: string;
      item1: { type: 'text' | 'image'; content: string };
      item2: { type: 'text' | 'image'; content: string };
      info: string;
    }[];
    questions?: {
      id: string;
      question: string;
      explanation: string;
      answers: { text: string; correct: boolean }[];
    }[];
    startingLives?: 3 | 4 | 5;
    passMarkPercent?: number;
    startingLevel?: number;
    garbageRows?: number;
    unoQuestions?: {
      id: string;
      question: string;
      explanation: string;
      answers: string[];
      correctIndex: number;
    }[];
    startingCards?: 3 | 5 | 7;
    botDifficulty?: 'easy' | 'medium' | 'hard';
    wordSearchWords?: {
      word: string;
      question: string;
      explanation: string;
      answers: string[];
      correctIndex: number;
    }[];
    wordSearchGridSize?: 10 | 12 | 15;
    timeLimit?: number;
    battleshipsQuestions?: {
      id: string;
      question: string;
      explanation: string;
      answers: string[];
      correctIndex: number;
    }[];
    gridSize?: 6 | 8 | 10;
    shipCount?: 3 | 4 | 5;
    millionaireQuestions?: {
      id: string;
      question: string;
      explanation: string;
      hint?: string;
      answers: string[];
      correctIndex: number;
    }[];
    timerSeconds?: 15 | 30 | 45 | 60;
    chaseQuestions?: {
      id: string;
      question: string;
      explanation: string;
      answers: string[];
      correctIndex: number;
    }[];
    chaseTimerSeconds?: 15 | 20 | 30;
    chaserAccuracy?: 60 | 70 | 80 | 90;
    headStart?: 1 | 2 | 3;
    boardSize?: 5 | 7 | 9;
  };
}

export interface TabsActivity extends BaseActivity {
  type: 'tabs';
  tabs: { id: string; title: string; icon?: string; content: string }[];
}

export interface TimelineActivity extends BaseActivity {
  type: 'timeline';
  title?: string;
  events: {
    id: string;
    title: string;
    date?: string;
    content: string;
    icon?: string;
    image?: string;
  }[];
}

export interface ButtonActivity extends BaseActivity {
  type: 'button';
  alignment?: 'left' | 'center' | 'right';
  buttons: {
    id: string;
    text: string;
    url: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning';
    size?: 'small' | 'medium' | 'large';
    icon?: string;
    openInNewTab?: boolean;
  }[];
}

export interface AudioActivity extends BaseActivity {
  type: 'audio';
  src: string;
  title?: string;
  description?: string;
  transcript?: string;
  downloadable?: boolean;
  required?: boolean;
}

export interface GalleryActivity extends BaseActivity {
  type: 'gallery';
  title?: string;
  layout?: 'carousel' | 'grid';
  images: { id: string; src: string; alt?: string; caption?: string }[];
  required?: boolean;
}

export interface DividerActivity extends BaseActivity {
  type: 'divider';
  style?: 'line' | 'dashed' | 'dotted' | 'gradient' | 'space';
  label?: string;
  height?: number;
  clickToContinue?: boolean;
}

export interface EmbedActivity extends BaseActivity {
  type: 'embed';
  url: string;
  embedCode?: string;
  title?: string;
  caption?: string;
  aspectRatio?: string;
  required?: boolean;
}

export interface ModelViewerActivity extends BaseActivity {
  type: 'model_viewer';
  modelUrl: string;
  driveFileId?: string;
  title?: string;
  caption?: string;
  poster?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
  backgroundColor?: string;
  required?: boolean;
}

export interface ScenarioNode {
  id: string;
  type: 'start' | 'content' | 'decision' | 'outcome';
  title: string;
  content?: string;
  position: { x: number; y: number };
}

export interface ScenarioChoice {
  id: string;
  text: string;
  targetNodeId: string;
  feedback?: string;
}

export interface ScenarioDecisionNode extends ScenarioNode {
  type: 'decision';
  question: string;
  choices: ScenarioChoice[];
}

export interface ScenarioOutcome {
  type: 'success' | 'partial' | 'failure' | 'retry';
  message: string;
  points?: number;
}

export interface ScenarioOutcomeNode extends ScenarioNode {
  type: 'outcome';
  outcome: ScenarioOutcome;
}

export interface ScreenRecordingActivity extends BaseActivity {
  type: 'screen_recording';
  title: string;
  description?: string;
  driveFileId: string;
  thumbnailUrl?: string;
  duration?: number;
  required?: boolean;
}

export interface LiveActivity extends BaseActivity {
  type: 'live';
  activityType: 'poll' | 'open_question';
  question: string;
  description?: string;
  imageUrl?: string;
  options?: { id: string; text: string }[];
  config?: {
    allowMultipleResponses?: boolean;
    showResults?: boolean;
    anonymous?: boolean;
  };
}

export interface BranchingScenarioActivity extends BaseActivity {
  type: 'branching_scenario';
  title: string;
  description?: string;
  nodes: (ScenarioNode | ScenarioDecisionNode | ScenarioOutcomeNode)[];
  startNodeId: string;
  required?: boolean;
}

export interface DiscussionActivity extends BaseActivity {
  type: 'discussion';
  title: string;
  prompt: string;
  description?: string;
  guidelines?: string;
  config?: {
    allowAnonymous?: boolean;
    requireResponse?: boolean;
    minResponseLength?: number;
    enableUpvoting?: boolean;
    enableReplies?: boolean;
    moderationEnabled?: boolean;
  };
  required?: boolean;
}

export interface FillInBlankActivity extends BaseActivity {
  type: 'fill_in_blank';
  text: string;
  instruction?: string;
  blanks: {
    id: string;
    answers: string[];
    hint?: string;
  }[];
  config?: {
    useWordBank?: boolean;
    caseSensitive?: boolean;
    shuffleWordBank?: boolean;
    showHintAfterAttempts?: number;
  };
  required?: boolean;
}

export type Activity =
  | TextContentActivity
  | ImageActivity
  | InfographicActivity
  | VideoActivity
  | YouTubeActivity
  | InteractiveVideoActivity
  | KnowledgeCheckActivity
  | FlashcardActivity
  | MatchingActivity
  | HotspotActivity
  | SequenceActivity
  | AccordionActivity
  | CodeSnippetActivity
  | InfoPanelActivity
  | DocumentViewerActivity
  | PDFActivity
  | SortingActivity
  | ProcessActivity
  | QuizActivity
  | GamificationActivity
  | TabsActivity
  | TimelineActivity
  | ButtonActivity
  | AudioActivity
  | GalleryActivity
  | DividerActivity
  | EmbedActivity
  | ModelViewerActivity
  | BranchingScenarioActivity
  | ScreenRecordingActivity
  | LiveActivity
  | FillInBlankActivity
  | DiscussionActivity;

// Course structure types
export interface CourseSection {
  id: string;
  title: string;
  order: number;
  activities: Activity[];
  paginatedStartLabel?: string;
}

export interface CourseThemeConfig {
  themePreset?: 'dark' | 'light' | 'editorial' | 'editorial-dark' | 'accessible' | 'holographic';
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl?: string;
  headerImageUrl?: string;
  headerImageVerticalPosition?: number;
}

export interface CourseContent {
  title: string;
  description?: string;
  sections: CourseSection[];
  theme?: CourseThemeConfig;
  language?: string;
}

// Progressive Generation Types
export interface SectionOutline {
  id: string;
  title: string;
  topics: string[];
  estimatedActivities: number;
  suggestedActivityTypes: ActivityType[];
}

export interface CourseOutline {
  title: string;
  description: string;
  sections: SectionOutline[];
  suggestedQuestions?: AIQuestion[];
}

export interface AIQuestion {
  id: string;
  question: string;
  context: string;
  type: 'multiple_choice' | 'free_text' | 'yes_no';
  options?: string[];
  relatedSectionIndex?: number;
}

export interface AIQuestionAnswer {
  questionId: string;
  answer: string;
}

export type GenerationStatus =
  | 'idle'
  | 'generating-outline'
  | 'awaiting-approval'
  | 'asking-question'
  | 'generating-section'
  | 'enriching-images'
  | 'complete'
  | 'error'
  | 'cancelled';

export interface ProgressiveGenerationState {
  status: GenerationStatus;
  outline: CourseOutline | null;
  completedSections: CourseSection[];
  currentSectionIndex: number;
  totalSections: number;
  pendingQuestion: AIQuestion | null;
  answeredQuestions: AIQuestionAnswer[];
  error: string | null;
  canRetry: boolean;
}

// Activity config for UI
export const ACTIVITY_CONFIG: Record<ActivityType, {
  icon: string;
  label: string;
  category: 'Content' | 'Interactive' | 'Media' | 'Advanced';
  description: string;
}> = {
  text_content: { icon: '📝', label: 'Text Content', category: 'Content', description: 'Add rich text paragraphs' },
  info_panel: { icon: 'ℹ️', label: 'Info Panel', category: 'Content', description: 'Highlight important info' },
  accordion: { icon: '📋', label: 'Accordion', category: 'Content', description: 'Collapsible sections' },
  tabs: { icon: '📑', label: 'Tabs', category: 'Content', description: 'Tabbed content panels' },
  timeline: { icon: '📅', label: 'Timeline', category: 'Content', description: 'Chronological events' },
  divider: { icon: '➖', label: 'Divider', category: 'Content', description: 'Visual separator' },
  knowledge_check: { icon: '❓', label: 'Knowledge Check', category: 'Interactive', description: 'Simple multiple choice' },
  quiz: { icon: '🏆', label: 'Final Quiz', category: 'Interactive', description: 'Timed, scored assessment' },
  flashcard: { icon: '🎴', label: 'Flashcards', category: 'Interactive', description: 'Flip cards for terms' },
  sorting: { icon: '🔄', label: 'Sorting', category: 'Interactive', description: 'Bucket sorting activity' },
  matching: { icon: '🔗', label: 'Matching', category: 'Interactive', description: 'Match pairs of items' },
  sequence: { icon: '🔢', label: 'Sequence', category: 'Interactive', description: 'Order items correctly' },
  hotspot: { icon: '🎯', label: 'Hotspot', category: 'Interactive', description: 'Interactive image spots' },
  gamification: { icon: '🎮', label: 'Gamification', category: 'Interactive', description: 'Memory match, Space Shooter' },
  interactive_video: { icon: '🎬', label: 'Interactive Video', category: 'Interactive', description: 'Video with checkpoints' },
  live: { icon: '📊', label: 'Live Activity', category: 'Interactive', description: 'Real-time Polls & Questions' },
  fill_in_blank: { icon: '✏️', label: 'Fill in the Blank', category: 'Interactive', description: 'Complete sentences' },
  image: { icon: '🖼️', label: 'Image', category: 'Media', description: 'Insert an image' },
  infographic: { icon: '📊', label: 'Infographic', category: 'Media', description: 'AI-generated infographic' },
  youtube: { icon: '📺', label: 'YouTube', category: 'Media', description: 'Embed a video' },
  video: { icon: '🎥', label: 'Video', category: 'Media', description: 'Embed a video file' },
  audio: { icon: '🎧', label: 'Audio', category: 'Media', description: 'Audio player' },
  gallery: { icon: '🖼️', label: 'Gallery', category: 'Media', description: 'Image carousel or grid' },
  model_viewer: { icon: '🎲', label: '3D Model', category: 'Media', description: 'Interactive 3D viewer' },
  screen_recording: { icon: '🎥', label: 'Screen Recording', category: 'Media', description: 'Record screen video' },
  pdf: { icon: '📄', label: 'PDF Document', category: 'Media', description: 'Embed a PDF viewer' },
  document_viewer: { icon: '📄', label: 'Document Viewer', category: 'Media', description: 'View documents' },
  embed: { icon: '🌐', label: 'Embed', category: 'Media', description: 'External iframe content' },
  process: { icon: '➡️', label: 'Process', category: 'Advanced', description: 'Step-by-step guide' },
  code_snippet: { icon: '💻', label: 'Code', category: 'Advanced', description: 'Display code blocks' },
  button: { icon: '🔘', label: 'Button / CTA', category: 'Advanced', description: 'Call-to-action buttons' },
  branching_scenario: { icon: '🌳', label: 'Branching Scenario', category: 'Advanced', description: 'Choose-your-own-adventure' },
  discussion: { icon: '💬', label: 'Discussion', category: 'Interactive', description: 'Discussion forum activity' },
};

export function getActivityDisplayInfo(activity: Activity): { icon: string; label: string } {
  const config = ACTIVITY_CONFIG[activity.type] || { icon: '📄', label: activity.type };
  return {
    icon: config.icon,
    label: activity.editorLabel || config.label,
  };
}
