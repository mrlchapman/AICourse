import { Sparkles, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardContent, EmptyState } from '@/components/ui';
import { getUserCourses } from '@/app/actions/courses';
import { CreateCourseButton } from './create-course-button';
import { CourseCard } from './course-card';

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
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
