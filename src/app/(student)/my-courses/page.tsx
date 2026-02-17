import Link from 'next/link';
import { getEnrolledCourses } from '@/app/actions/student';
import { BookOpen, Clock, PlayCircle, Plus } from 'lucide-react';
import { Card, CardContent, Button, Badge, EmptyState } from '@/components/ui';

export default async function MyCoursesPage() {
  const { enrollments, error } = await getEnrolledCourses();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-foreground-muted mt-1">Your enrolled courses and progress</p>
        </div>
        <Link href="/join">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Join Course
          </Button>
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="No courses yet"
              description="Enter an invite code to join your first course"
              action={
                <Link href="/join">
                  <Button>Join a Course</Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment: any) => {
            const course = enrollment.course;
            if (!course) return null;

            // Calculate progress percentage
            const totalActivities = course.content?.sections?.reduce(
              (acc: number, section: any) => acc + (section.activities?.length || 0),
              0
            ) || 0;
            const completedCount = Object.keys(enrollment.progress || {}).filter(
              (k) => !k.startsWith('_') && enrollment.progress[k]?.status === 'completed'
            ).length;
            const percent = totalActivities > 0
              ? Math.min(100, Math.round((completedCount / totalActivities) * 100))
              : 0;

            const isCompleted = enrollment.status === 'completed' || enrollment.status === 'passed';

            return (
              <Card key={enrollment.id} className="overflow-hidden hover:shadow-md transition-shadow" aria-label={`Course: ${course.title}`}>
                {/* Header gradient */}
                <div className="h-32 bg-gradient-to-br from-primary/80 to-primary/40 p-5 flex items-end relative">
                  <h3 className="text-lg font-bold text-white relative z-10 line-clamp-2">
                    {course.title}
                  </h3>
                </div>

                <CardContent className="pt-4">
                  {/* Metadata */}
                  <div className="flex justify-between items-center text-sm mb-4">
                    <div className="flex items-center gap-1.5 text-foreground-subtle">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs">
                        {enrollment.last_accessed_at
                          ? new Date(enrollment.last_accessed_at).toLocaleDateString()
                          : 'Not started'}
                      </span>
                    </div>
                    <Badge variant={isCompleted ? 'success' : 'warning'} aria-label={`Status: ${isCompleted ? 'Completed' : enrollment.status === 'in_progress' ? 'In Progress' : 'Enrolled'}`}>
                      {isCompleted ? 'Completed' : enrollment.status === 'in_progress' ? 'In Progress' : 'Enrolled'}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="mb-5">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-foreground-muted">Progress</span>
                      <span className="font-mono text-primary font-medium">
                        {isCompleted ? 100 : percent}%
                      </span>
                    </div>
                    <div
                      className="h-2 bg-surface-hover rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={isCompleted ? 100 : percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Course progress: ${isCompleted ? 100 : percent}%`}
                    >
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${isCompleted ? 100 : percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Score (if completed) */}
                  {isCompleted && enrollment.final_score !== null && (
                    <div className="flex items-center justify-between text-sm mb-4 p-2 bg-surface-hover rounded-lg">
                      <span className="text-foreground-muted">Final Score</span>
                      <span className="font-bold text-foreground">{enrollment.final_score}%</span>
                    </div>
                  )}

                  {/* CTA */}
                  <Link href={`/learn/${enrollment.id}`} className="block">
                    <Button variant="secondary" className="w-full">
                      <PlayCircle className="h-4 w-4 mr-1.5" />
                      {percent === 0 ? 'Start Course' : isCompleted ? 'Review Course' : 'Resume Course'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
