/**
 * Activity Type Definitions
 * Each activity is a self-contained, modular component
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
  editorLabel?: string; // Custom label for the editor UI
  comments?: {
    author: string;
    text: string;
    timestamp: string;
  }[]; // Comments from UCLeeds or system for review purposes
}

export interface TextContentActivity extends BaseActivity {
  type: 'text_content';
  content: string; // HTML content
}

export interface ImageActivity extends BaseActivity {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  required?: boolean; // If true, must be viewed to proceed
  geminiPrompt?: string; // AI-generated prompt for Gemini image generation
}

export interface InfographicActivity extends BaseActivity {
  type: 'infographic';
  src: string; // URL to the infographic image
  alt: string;
  title?: string;
  caption?: string;
  required?: boolean; // If true, must be viewed to proceed
  infographicPrompt: string; // Detailed AI-generated prompt for creating infographic in Gemini
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
  required?: boolean; // If true, must be watched to proceed
}

// Interactive Video - Edpuzzle-style video with checkpoints
export interface VideoCheckpoint {
  id: string;
  timestamp: number; // in seconds
  type: 'explanation' | 'knowledge_check';
  // For explanations
  title?: string;
  content?: string; // HTML content for the explanation
  // For knowledge checks
  question?: string;
  options?: {
    id: string;
    text: string;
    correct: boolean;
  }[];
  explanation?: string; // Feedback after answering
}

export interface InteractiveVideoActivity extends BaseActivity {
  type: 'interactive_video';
  videoId: string; // YouTube video ID
  caption?: string;
  checkpoints: VideoCheckpoint[];
  required?: boolean; // If true, must complete all checkpoints to proceed
  preventSkipping?: boolean; // If true, user cannot skip ahead past checkpoints
}

export interface KnowledgeCheckActivity extends BaseActivity {
  type: 'knowledge_check';
  question: string;
  options: {
    id: string;
    text: string;
    correct: boolean;
  }[];
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
  pairs: {
    id: string;
    left: string;
    right: string;
  }[];
}

export interface HotspotActivity extends BaseActivity {
  type: 'hotspot';
  imageUrl: string;
  hotspots: {
    id: string;
    x: number; // percentage
    y: number; // percentage
    title: string;
    content: string;
  }[];
}

export interface SequenceActivity extends BaseActivity {
  type: 'sequence';
  title: string;
  items: {
    id: string;
    text: string;
    order: number;
  }[];
}

export interface AccordionActivity extends BaseActivity {
  type: 'accordion';
  required?: boolean; // If true, all sections must be read before proceeding
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
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
  driveFileId?: string; // For Google Drive integration
  required?: boolean; // If true, must be viewed to proceed
}

export interface SortingActivity extends BaseActivity {
  type: 'sorting';
  title: string;
  categories: {
    id: string;
    title: string;
  }[];
  items: {
    id: string;
    text: string;
    categoryId: string;
  }[];
}

export interface ProcessActivity extends BaseActivity {
  type: 'process';
  steps: {
    id: string;
    title: string;
    content: string;
  }[];
}

export interface QuizActivity extends BaseActivity {
  type: 'quiz';
  title: string;
  description: string;
  timeLimit: number; // in seconds
  passingScore: number; // percentage
  questions: {
    id: string;
    text: string;
    points: number;
    options: {
      id: string;
      text: string;
      correct: boolean;
    }[];
    feedback?: string;
    imageUrl?: string;
  }[];
}

export interface GamificationActivity extends BaseActivity {
  type: 'gamification';
  gameType: 'memory_match' | 'neon_defender' | 'knowledge_tetris' | 'quiz_uno' | 'word_search' | 'battleships' | 'millionaire' | 'the_chase'; // extensible for later
  config: {
    // Common
    required?: boolean;

    // Memory Match Config
    penaltyShuffle?: boolean;
    pairs?: {
      id: string;
      item1: { type: 'text' | 'image'; content: string };
      item2: { type: 'text' | 'image'; content: string };
      info: string; // content to show on match
    }[];

    // Synth Defender Config
    questions?: {
      id: string;
      question: string;
      explanation: string;
      answers: { text: string; correct: boolean }[];
    }[];
    startingLives?: 3 | 4 | 5; // Difficulty: fewer = harder
    passMarkPercent?: number;  // 50-100, score threshold to pass

    // Knowledge Tetris Config
    startingLevel?: number;  // 1-5, starting speed
    garbageRows?: number;    // 1-3, rows added on wrong answer

    // Quiz Uno Config
    unoQuestions?: {
      id: string;
      question: string;
      explanation: string;  // shown after answering
      answers: string[];
      correctIndex: number;
    }[];
    startingCards?: 3 | 5 | 7;  // Number of cards dealt to each player
    botDifficulty?: 'easy' | 'medium' | 'hard';  // Bot play style

    // Word Search Config
    wordSearchWords?: {
      word: string;
      question: string;
      explanation: string;
      answers: string[];
      correctIndex: number;
    }[];  // Words to find in the grid, each with an associated question
    wordSearchGridSize?: 10 | 12 | 15;  // Grid size (larger = harder to find words)
    timeLimit?: number;  // Optional time limit in seconds (0 = no limit)

    // Battleships Config
    battleshipsQuestions?: {
      id: string;
      question: string;
      explanation: string;
      answers: string[];
      correctIndex: number;
    }[];
    gridSize?: 6 | 8 | 10;  // Grid size (6x6, 8x8, 10x10)
    shipCount?: 3 | 4 | 5;  // Number of ships per side

    // Millionaire Config
    millionaireQuestions?: {
      id: string;
      question: string;
      explanation: string;
      hint?: string;  // Optional hint for lifeline
      answers: string[];
      correctIndex: number;
    }[];
    timerSeconds?: 15 | 30 | 45 | 60;  // Time per question (0 = off)

    // The Chase Config
    chaseQuestions?: {
      id: string;
      question: string;
      explanation: string;
      answers: string[];
      correctIndex: number;
    }[];
    chaseTimerSeconds?: 15 | 20 | 30;  // Time per question
    chaserAccuracy?: 60 | 70 | 80 | 90;  // How often the chaser gets it right
    headStart?: 1 | 2 | 3;  // Player's head start on the ladder
    boardSize?: 5 | 7 | 9;  // Total ladder steps
  };
}

// NEW CONTENT BLOCKS

export interface TabsActivity extends BaseActivity {
  type: 'tabs';
  tabs: {
    id: string;
    title: string;
    icon?: string;
    content: string; // HTML content
  }[];
}

export interface TimelineActivity extends BaseActivity {
  type: 'timeline';
  title?: string;
  events: {
    id: string;
    title: string;
    date?: string;
    content: string; // HTML content
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
  transcript?: string; // HTML content
  downloadable?: boolean;
  required?: boolean; // If true, must be listened to proceed
}

export interface GalleryActivity extends BaseActivity {
  type: 'gallery';
  title?: string;
  layout?: 'carousel' | 'grid';
  images: {
    id: string;
    src: string;
    alt?: string;
    caption?: string;
  }[];
  required?: boolean; // If true, must be viewed to proceed
}

export interface DividerActivity extends BaseActivity {
  type: 'divider';
  style?: 'line' | 'dashed' | 'dotted' | 'gradient' | 'space';
  label?: string;
  height?: number; // for space style
  clickToContinue?: boolean; // If true, creates a sub-section break with a Continue button
}

export interface EmbedActivity extends BaseActivity {
  type: 'embed';
  url: string;
  embedCode?: string; // For raw HTML embeds
  title?: string;
  caption?: string;
  aspectRatio?: string; // e.g. '16:9', '4:3', '1:1'
  required?: boolean; // If true, must be viewed to proceed
}

export interface ModelViewerActivity extends BaseActivity {
  type: 'model_viewer';
  modelUrl: string;           // URL to the 3D model file (.glb, .gltf, .obj, .stl)
  driveFileId?: string;       // For Google Drive integration
  title?: string;
  caption?: string;
  poster?: string;            // Preview/poster image URL
  autoRotate?: boolean;       // Auto-spin the model
  cameraControls?: boolean;   // Allow user to rotate/zoom/pan
  ar?: boolean;               // Enable AR viewing (mobile)
  backgroundColor?: string;   // Background color for the viewer
  required?: boolean;         // If true, must be viewed to proceed
}

// Branching Scenario Types - Choose Your Own Adventure
export interface ScenarioNode {
  id: string;
  type: 'start' | 'content' | 'decision' | 'outcome';
  title: string;
  content?: string; // HTML content for the node
  position: { x: number; y: number }; // For visual editor
}

export interface ScenarioChoice {
  id: string;
  text: string;
  targetNodeId: string;
  feedback?: string; // Shown after choosing this option
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
  thumbnailUrl?: string; // Optional thumbnail
  duration?: number; // Optional duration in seconds
  required?: boolean;
}

export interface LiveActivity extends BaseActivity {
  type: 'live';
  activityType: 'poll' | 'open_question';
  question: string;
  description?: string; // Optional context
  imageUrl?: string;    // Optional image
  options?: {           // For Polls
    id: string;
    text: string;
  }[];
  config?: {
    allowMultipleResponses?: boolean; // For Open Question (limit 1 or many)
    showResults?: boolean;            // Whether to show results to student after voting
    anonymous?: boolean;              // If true, don't ask for name (though we might not ask anyway in SCORM)
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

export interface FillInBlankActivity extends BaseActivity {
  type: 'fill_in_blank';
  /** The text with {0}, {1}, {2} etc. as placeholders for blanks */
  text: string;
  /** Instruction text shown above the activity */
  instruction?: string;
  /** Array of blanks matching the placeholders in text */
  blanks: {
    id: string;
    /** Accepted answers - first is the "primary" answer shown on reveal */
    answers: string[];
    /** Hint shown as placeholder or after failed attempts */
    hint?: string;
  }[];
  /** Configuration options */
  config?: {
    /** Show word bank instead of free typing */
    useWordBank?: boolean;
    /** Case sensitive matching (default false) */
    caseSensitive?: boolean;
    /** Shuffle word bank order */
    shuffleWordBank?: boolean;
    /** Show hint after this many wrong attempts (0 = never) */
    showHintAfterAttempts?: number;
  };
  /** Whether this activity must be completed to progress */
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

export interface CourseSection {
  id: string;
  title: string;
  order: number;
  activities: Activity[];
  paginatedStartLabel?: string; // Label for the first page if dividers are used
}

export interface CourseThemeConfig {
  themePreset?: 'dark' | 'light' | 'editorial' | 'editorial-dark' | 'accessible' | 'holographic'; // Theme presets
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl?: string; // Kept for backward compatibility/types, though removed from UI
  headerImageUrl?: string;
  headerImageVerticalPosition?: number; // 0-100
}

export interface CourseContent {
  title: string;
  description?: string;
  sections: CourseSection[];
  theme?: CourseThemeConfig;
  language?: string; // ISO 639-1 code: 'en', 'es', 'fr', etc.
}

// ============================================
// Progressive Generation Types
// ============================================

/**
 * Section outline - generated first during progressive build
 * Contains structure but not full activity content
 */
export interface SectionOutline {
  id: string;
  title: string;
  topics: string[];
  estimatedActivities: number;
  suggestedActivityTypes: ActivityType[];
}

/**
 * Course outline - the structure generated before full content
 * Allows user to review/modify before section expansion
 */
export interface CourseOutline {
  title: string;
  description: string;
  sections: SectionOutline[];
  suggestedQuestions?: AIQuestion[];
}

/**
 * AI question for mid-generation interaction
 * Allows the AI to ask clarifying questions between sections
 */
export interface AIQuestion {
  id: string;
  question: string;
  context: string; // Why AI is asking this question
  type: 'multiple_choice' | 'free_text' | 'yes_no';
  options?: string[]; // For multiple_choice type
  relatedSectionIndex?: number; // Which section this question relates to
}

/**
 * User's answer to an AI question
 */
export interface AIQuestionAnswer {
  questionId: string;
  answer: string;
}

/**
 * Generation state machine status
 */
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

/**
 * Full state for progressive generation
 */
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

/**
 * Shared activity configuration for UI labels, icons, and categories
 * Use this instead of duplicating the config in multiple components
 */
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
  interactive_video: { icon: '🎬', label: 'Interactive Video', category: 'Interactive', description: 'Edpuzzle-style video with checkpoints' },
  live: { icon: '📊', label: 'Live Activity', category: 'Interactive', description: 'Real-time Polls & Open Questions' },
  image: { icon: '🖼️', label: 'Image', category: 'Media', description: 'Insert an image' },
  infographic: { icon: '📊', label: 'Infographic', category: 'Media', description: 'AI-generated infographic' },
  youtube: { icon: '📺', label: 'YouTube', category: 'Media', description: 'Embed a video' },
  video: { icon: '🎥', label: 'Video', category: 'Media', description: 'Embed a video file' },
  audio: { icon: '🎧', label: 'Audio', category: 'Media', description: 'Audio player with controls' },
  gallery: { icon: '🖼️', label: 'Gallery', category: 'Media', description: 'Image carousel or grid' },
  model_viewer: { icon: '🎲', label: '3D Model', category: 'Media', description: 'Interactive 3D viewer' },
  screen_recording: { icon: '🎥', label: 'Screen Recording', category: 'Media', description: 'Record screen & camera video' },
  pdf: { icon: '📄', label: 'PDF Document', category: 'Media', description: 'Embed a PDF viewer' },
  document_viewer: { icon: '📄', label: 'Document Viewer', category: 'Media', description: 'View documents' },
  embed: { icon: '🌐', label: 'Embed', category: 'Media', description: 'External iframe content' },
  process: { icon: '➡️', label: 'Process', category: 'Advanced', description: 'Step-by-step guide' },
  code_snippet: { icon: '💻', label: 'Code', category: 'Advanced', description: 'Display code blocks' },
  button: { icon: '🔘', label: 'Button / CTA', category: 'Advanced', description: 'Call-to-action buttons' },
  branching_scenario: { icon: '🌳', label: 'Branching Scenario', category: 'Advanced', description: 'Choose-your-own-adventure' },
  fill_in_blank: { icon: '✏️', label: 'Fill in the Blank', category: 'Interactive', description: 'Complete sentences with missing words' },
  discussion: { icon: '💬', label: 'Discussion', category: 'Interactive', description: 'Discussion forum activity' },
};

/**
 * Get activity display info with optional custom label override
 */
export function getActivityDisplayInfo(activity: Activity): { icon: string; label: string } {
  const config = ACTIVITY_CONFIG[activity.type] || { icon: '📄', label: activity.type };
  return {
    icon: config.icon,
    label: activity.editorLabel || config.label,
  };
}

