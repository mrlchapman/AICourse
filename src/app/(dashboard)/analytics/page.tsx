import { getTeacherStats } from '@/app/actions/teacher';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  Award,
  Clock,
  BookOpen,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';

export default async function GlobalAnalyticsPage() {
  const stats = await getTeacherStats();

  if (stats.error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-4">Analytics</h1>
        <p className="text-foreground-muted">Unable to load analytics data.</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0m';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const courses = stats.courses || [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-foreground-muted mt-1">Overview of all your courses and students</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalStudents || 0}</p>
                <p className="text-xs text-foreground-muted">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completionRate || 0}%</p>
                <p className="text-xs text-foreground-muted">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.avgScore ? `${stats.avgScore}%` : '--'}
                </p>
                <p className="text-xs text-foreground-muted">Avg. Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatDuration(stats.avgTimeSpent || 0)}
                </p>
                <p className="text-xs text-foreground-muted">Avg. Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Course Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Course Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-8 w-8 text-foreground-subtle mx-auto mb-2" />
              <p className="text-foreground-muted">No courses yet</p>
              <p className="text-xs text-foreground-subtle mt-1">
                Create a course to start seeing analytics
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map((course: any) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}/analytics`}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-hover transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {course.title}
                      </h3>
                      <Badge variant={course.is_hosted ? 'success' : 'default'} className="shrink-0">
                        {course.is_hosted ? 'Live' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-foreground-subtle">
                      <span>{course.enrolled} students</span>
                      <span>{course.completionRate}% completion</span>
                      {course.avgScore !== null && <span>Avg: {course.avgScore}%</span>}
                    </div>
                  </div>

                  {/* Mini completion bar */}
                  <div className="w-24 shrink-0 hidden sm:block">
                    <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${course.completionRate}%` }}
                      />
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-foreground-subtle group-hover:text-foreground transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
