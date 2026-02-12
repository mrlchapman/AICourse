# AI Course Creator - Project Status

## What This Is
Standalone course creation tool combining:
- **LeesDash** course engine (38+ activity types, AI generation, SCORM export)
- **CourseCreatorNEW** hosting + student engagement tracking
- **New three-panel editor** (Articulate 360 inspired)

## Tech Stack
- Next.js (App Router) + Tailwind CSS v4 + Framer Motion + Lucide icons
- Supabase (PostgreSQL + Auth)
- AI: Gemini 2.5 Flash (primary) + OpenAI GPT-4o-mini
- Storage: Supabase (courses in JSONB) + optional Google Drive

## What's Working

### Auth
- Email/password signup + login
- Google OAuth
- Self-healing profile creation (admin client bypasses RLS)
- Route protection via proxy middleware

### Course Editor (Three-Panel)
- **Outline sidebar** - sections list, add/delete/reorder sections
- **Page canvas** - activity blocks for selected section, add via insert menu
- **Inspector panel** - click activity to edit properties
- **All 32 activity editors** wired up (matching, quiz, gamification, branching scenario, etc.)
- Save to Supabase works (Save button in top bar)
- Course title editing inline

### AI Builder (`/courses/new`)
- Paste text or upload file (PDF, DOCX, PPTX, TXT)
- Two modes: "Review Outline First" (progressive) or "Quick Build"
- Uses Gemini API key from `.env.local` automatically (or user can provide their own)
- Generates full course with sections + activities
- "Open in Editor" button after generation saves to Supabase and redirects

### Courses Page (`/courses`)
- Lists all user courses from Supabase (card grid)
- **"New Course"** button - creates blank course, opens editor
- **"Create with AI"** button - opens AI builder wizard
- Shows status (draft/published), hosted indicator, last edited date

### Hosting & Student Features (ported, not fully tested)
- Course publishing, invite codes, student enrollment
- Progress tracking, time tracking, device tracking
- Course player (iframe + SCORM bridge)
- Student dashboard, teacher analytics

## Known Issues / Not Yet Tested

1. **Duplicate section keys** - AI generator sometimes creates sections with duplicate IDs (`section-2` appearing twice). The ID generation uses `Date.now()` which can collide.

2. **Google Drive integration** - Settings page is still a placeholder. Drive auth flow exists but hasn't been tested end-to-end in this project.

3. **SCORM export** - Export button exists in top bar but not wired up yet. The SCORM builder code needs to be ported from LeesDash.

4. **Preview mode** - Preview button in editor not functional yet.

5. **Theme editor** - Palette button in editor not functional yet. Theme types exist.

6. **Collaboration** - Presence, locking, comments, sharing - types exist but not implemented.

7. **Analytics dashboard** - Pages exist as placeholders, not wired to real data.

8. **Course player** - Exists at `/learn/[enrollmentId]` but needs testing.

9. **Undo/Redo** - Not implemented in editor yet (was in LeesDash via hooks).

10. **Drag-and-drop reordering** - In outline sidebar code but @dnd-kit may need wiring.

## Environment Setup

### `.env.local` required variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI (at least one required for AI builder)
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key  # optional

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Supabase Setup
1. Create project at supabase.com
2. Run `supabase/schema.sql` to create tables
3. **IMPORTANT:** Run the RLS fix SQL (helper functions + non-recursive policies). The original schema.sql has circular RLS policies that cause infinite recursion. The fix uses SECURITY DEFINER functions (`get_my_user_id()`, `get_my_course_ids()`, `get_my_enrolled_course_ids()`).
4. All server-side queries use `getSupabaseAdmin()` to bypass RLS entirely.

## Key File Locations

| Purpose | Path |
|---------|------|
| Activity types (all 38+) | `src/types/activities.ts` |
| Three-panel editor | `src/components/editor/editor-shell.tsx` |
| All activity editors (32) | `src/components/editor/inspector/editors/*.tsx` |
| Inspector panel (switch) | `src/components/editor/inspector/inspector-panel.tsx` |
| AI builder wizard | `src/components/ai-builder/ai-builder-wizard.tsx` |
| AI generation steps | `src/components/ai-builder/steps/*.tsx` |
| Course CRUD actions | `src/app/actions/courses.ts` |
| Teacher actions | `src/app/actions/teacher.ts` |
| Student actions | `src/app/actions/student.ts` |
| Auth actions | `src/app/actions/auth.ts` |
| AI generate API | `src/app/api/ai/generate/route.ts` |
| Document parser | `src/lib/ai/documentParser.ts` |
| Supabase admin client | `src/lib/supabase/admin.ts` |
| Proxy (middleware) | `src/proxy.ts` |
| DB schema | `supabase/schema.sql` |

## What to Work On Next (Priority Order)

1. **Test full flow end-to-end** - Create with AI, edit, save, reload
2. **Wire up SCORM export** - Port from LeesDash (`src/lib/scorm/`)
3. **Wire up Preview mode** - Render course as student would see it
4. **Theme editor** - Port theme picker from LeesDash
5. **Undo/Redo** - Port editor hooks from LeesDash
6. **DnD reordering** - Ensure @dnd-kit works for activity reordering
7. **Course hosting flow** - Test publish, invite codes, student join
8. **Analytics** - Wire dashboards to real enrollment data
