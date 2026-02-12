export type UserRole = 'teacher' | 'student' | 'admin';
export type CourseStatus = 'draft' | 'published';
export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'passed';
export type CollaboratorRole = 'viewer' | 'editor' | 'admin';

export interface User {
  id: string;
  auth_user_id: string;
  email: string | null;
  display_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserIntegration {
  id: string;
  user_id: string;
  provider: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: number | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  google_drive_file_id: string | null;
  title: string;
  description: string;
  content: CourseContent;
  status: CourseStatus;
  is_hosted: boolean;
  hosted_at: string | null;
  has_deadline: boolean;
  course_deadline: string | null;
  submission_deadline: string | null;
  assets_published: boolean;
  published_at: string | null;
  last_edited_at: string;
  created_at: string;
  updated_at: string;
}

export interface CourseFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface CourseInvite {
  id: string;
  course_id: string;
  code: string;
  created_by: string;
  uses: number;
  max_uses: number | null;
  expires_at: string | null;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  invite_id: string | null;
  status: EnrollmentStatus;
  progress: Record<string, unknown>;
  current_activity_id: string | null;
  responses: unknown[];
  final_score: number | null;
  total_time_spent: number;
  time_to_complete: number | null;
  revisits: number;
  last_device: string | null;
  joined_at: string;
  last_accessed_at: string;
  completed_at: string | null;
}

export interface CourseCollaborator {
  id: string;
  course_id: string;
  user_id: string;
  role: CollaboratorRole;
  invited_by: string | null;
  created_at: string;
}

export interface ActivityComment {
  id: string;
  course_id: string;
  activity_id: string;
  section_id: string;
  user_id: string;
  content: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityTemplate {
  id: string;
  user_id: string;
  name: string;
  activity_type: string;
  content: unknown;
  is_public: boolean;
  created_at: string;
}

export interface AIToolPreferences {
  id: string;
  user_id: string;
  default_model: string;
  gemini_api_key: string | null;
  openai_api_key: string | null;
  pexels_api_key: string | null;
  created_at: string;
  updated_at: string;
}

// Course content types (ported from LeesDash)
export interface CourseContent {
  title: string;
  description?: string;
  sections: CourseSection[];
  theme?: CourseThemeConfig;
  viewMode?: 'standard' | 'learning_map';
}

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

// Activity type union - will be expanded in types/activities.ts
export type ActivityType =
  | 'text_content'
  | 'info_panel'
  | 'accordion'
  | 'tabs'
  | 'timeline'
  | 'divider'
  | 'knowledge_check'
  | 'quiz'
  | 'flashcard'
  | 'matching'
  | 'hotspot'
  | 'sequence'
  | 'sorting'
  | 'process'
  | 'gamification'
  | 'fill_in_blank'
  | 'image'
  | 'infographic'
  | 'video'
  | 'youtube'
  | 'interactive_video'
  | 'audio'
  | 'gallery'
  | 'pdf'
  | 'embed'
  | 'model_viewer'
  | 'screen_recording'
  | 'code_snippet'
  | 'button'
  | 'branching_scenario'
  | 'live'
  | 'mind_map'
  | 'document_viewer';

export interface BaseActivity {
  id: string;
  type: ActivityType;
  order: number;
  editorLabel?: string;
  comments?: Array<{ author: string; text: string; timestamp: string }>;
}

// Generic Activity type (detailed types will be defined per-activity in Phase 2)
export type Activity = BaseActivity & Record<string, unknown>;

// Activity config for UI (categories, icons, labels)
export interface ActivityConfig {
  icon: string;
  label: string;
  category: 'Content' | 'Interactive' | 'Media' | 'Advanced';
  description: string;
}
