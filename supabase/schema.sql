-- AI Course Creator - Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'student', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER INTEGRATIONS (Google Drive tokens etc)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google_drive',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  google_drive_file_id TEXT,
  title TEXT NOT NULL DEFAULT 'Untitled Course',
  description TEXT DEFAULT '',
  content JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  -- Hosting fields
  is_hosted BOOLEAN DEFAULT FALSE,
  hosted_at TIMESTAMPTZ,
  has_deadline BOOLEAN DEFAULT FALSE,
  course_deadline TIMESTAMPTZ,
  submission_deadline TIMESTAMPTZ,
  assets_published BOOLEAN DEFAULT FALSE,
  -- Metadata
  published_at TIMESTAMPTZ,
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_user ON public.courses(user_id);
CREATE INDEX idx_courses_drive ON public.courses(google_drive_file_id);

-- ============================================================
-- COURSE FOLDERS (organization)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.course_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COURSE TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE(course_id, tag)
);

-- ============================================================
-- COURSE INVITES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  uses INTEGER DEFAULT 0,
  max_uses INTEGER,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invites_code ON public.course_invites(code);

-- ============================================================
-- COURSE ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite_id UUID REFERENCES public.course_invites(id),
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'passed')),
  progress JSONB DEFAULT '{}',
  current_activity_id TEXT,
  responses JSONB DEFAULT '[]',
  final_score NUMERIC,
  -- Time tracking
  total_time_spent INTEGER DEFAULT 0,
  time_to_complete INTEGER,
  revisits INTEGER DEFAULT 0,
  last_device TEXT,
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(course_id, student_id)
);

CREATE INDEX idx_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX idx_enrollments_student ON public.course_enrollments(student_id);

-- ============================================================
-- COURSE COLLABORATORS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  invited_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- ============================================================
-- ACTIVITY COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  content JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI TOOL PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_tool_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  default_model TEXT DEFAULT 'gemini-2.5-flash',
  gemini_api_key TEXT,
  openai_api_key TEXT,
  pexels_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tool_preferences ENABLE ROW LEVEL SECURITY;

-- Users: can read own profile, teachers can read student profiles for their courses
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Teachers can see students enrolled in their courses
CREATE POLICY "Teachers can view enrolled students"
  ON public.users FOR SELECT
  USING (
    id IN (
      SELECT ce.student_id FROM public.course_enrollments ce
      JOIN public.courses c ON c.id = ce.course_id
      JOIN public.users u ON u.id = c.user_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- User integrations
CREATE POLICY "Users manage own integrations"
  ON public.user_integrations FOR ALL
  USING (user_id = auth.uid());

-- Courses: owners + collaborators can read/write
CREATE POLICY "Course owners have full access"
  ON public.courses FOR ALL
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Collaborators can read courses"
  ON public.courses FOR SELECT
  USING (
    id IN (
      SELECT course_id FROM public.course_collaborators
      WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Students can read hosted courses they're enrolled in"
  ON public.courses FOR SELECT
  USING (
    is_hosted = TRUE AND id IN (
      SELECT course_id FROM public.course_enrollments
      WHERE student_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
  );

-- Course folders
CREATE POLICY "Users manage own folders"
  ON public.course_folders FOR ALL
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Course tags
CREATE POLICY "Course tag access follows course access"
  ON public.course_tags FOR ALL
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Course invites
CREATE POLICY "Teachers manage invites for their courses"
  ON public.course_invites FOR ALL
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can read invites by code"
  ON public.course_invites FOR SELECT
  USING (TRUE);

-- Course enrollments
CREATE POLICY "Students manage own enrollments"
  ON public.course_enrollments FOR ALL
  USING (
    student_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Teachers view enrollments for their courses"
  ON public.course_enrollments FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can delete enrollments for their courses"
  ON public.course_enrollments FOR DELETE
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Course collaborators
CREATE POLICY "Course owners manage collaborators"
  ON public.course_collaborators FOR ALL
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Collaborators can see their own records"
  ON public.course_collaborators FOR SELECT
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Activity comments
CREATE POLICY "Comment access follows course access"
  ON public.activity_comments FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      )
    )
    OR
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users manage own comments"
  ON public.activity_comments FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users delete own comments"
  ON public.activity_comments FOR DELETE
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Activity templates
CREATE POLICY "Users manage own templates"
  ON public.activity_templates FOR ALL
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Public templates are readable"
  ON public.activity_templates FOR SELECT
  USING (is_public = TRUE);

-- AI preferences
CREATE POLICY "Users manage own AI preferences"
  ON public.ai_tool_preferences FOR ALL
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- ============================================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER user_integrations_updated_at BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER ai_prefs_updated_at BEFORE UPDATE ON public.ai_tool_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
