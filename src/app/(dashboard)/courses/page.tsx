import { Plus, Sparkles, FolderOpen, MoreHorizontal, Pencil, Trash2, Globe, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardContent, EmptyState } from '@/components/ui';
import { getUserCourses } from '@/app/actions/courses';
import { CreateCourseButton } from './create-course-button';

export default async function CoursesPage() {
  const { courses, error } = await getUserCourses();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-foreground-muted mt-1">Manage all your courses</p>
        </div>
        <div className="flex gap-2">
          <Link href="/courses/new">
            <Button variant="secondary" size="sm">
              <Sparkles className="h-4 w-4" />
              Create with AI
            </Button>
          </Link>
          <CreateCourseButton />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FolderOpen className="h-12 w-12" />}
              title="No courses yet"
              description="Create your first course to get started. You can use AI to generate content or build it manually."
              action={
                <div className="flex gap-2">
                  <Link href="/courses/new">
                    <Button variant="secondary" size="sm">
                      <Sparkles className="h-4 w-4" />
                      Create with AI
                    </Button>
                  </Link>
                  <CreateCourseButton />
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course: any) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}/edit`}
              className="group"
            >
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {course.title || 'Untitled Course'}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {course.is_hosted && (
                        <span className="p-1 text-green-600" title="Published">
                          <Globe className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                        course.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {course.status || 'draft'}
                      </span>
                    </div>
                  </div>

                  {course.description && (
                    <p className="text-xs text-foreground-muted line-clamp-2 mb-3">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-[10px] text-foreground-subtle">
                    <Clock className="h-3 w-3" />
                    {course.last_edited_at
                      ? `Edited ${new Date(course.last_edited_at).toLocaleDateString()}`
                      : `Created ${new Date(course.created_at).toLocaleDateString()}`}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
