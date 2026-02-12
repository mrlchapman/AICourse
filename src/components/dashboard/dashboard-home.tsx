'use client';

import { Plus, Sparkles, BookOpen, Users, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import type { User } from '@/types/database';

interface DashboardHomeProps {
  user: User;
  stats: {
    courseCount: number;
    studentCount: number;
    completionRate: number;
    recentCourses: any[];
  };
}

export function DashboardHome({ user, stats }: DashboardHomeProps) {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user.display_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-foreground-muted mt-1">
          Create engaging courses with AI or build them manually.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="hover:border-primary/30 transition-colors cursor-pointer group">
          <Link href="/courses/new" className="block">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="h-12 w-12 rounded-xl bg-primary-light text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Create with AI</h3>
                <p className="text-sm text-foreground-muted">
                  Generate a course from a topic, document, or paste text
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/30 transition-colors cursor-pointer group">
          <Link href="/courses?new=manual" className="block">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="h-12 w-12 rounded-xl bg-primary-light text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Build manually</h3>
                <p className="text-sm text-foreground-muted">
                  Start with a blank course and add activities
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.courseCount}</p>
              <p className="text-sm text-foreground-muted">Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-lg bg-success-light text-success flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.studentCount}</p>
              <p className="text-sm text-foreground-muted">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-lg bg-warning-light text-amber-600 flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.studentCount > 0 ? `${stats.completionRate}%` : '--'}
              </p>
              <p className="text-sm text-foreground-muted">Avg. Completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Courses</h2>
          <Link href="/courses" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {stats.recentCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-10 w-10 text-foreground-subtle mx-auto mb-3" />
              <p className="text-foreground-muted">No courses yet</p>
              <p className="text-sm text-foreground-subtle mt-1">
                Create your first course to get started
              </p>
              <div className="mt-4">
                <Link href="/courses/new">
                  <Button variant="primary" size="sm">Create Course</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {stats.recentCourses.map((course: any) => (
              <Card key={course.id} className="hover:border-border-hover transition-colors">
                <Link href={`/courses/${course.id}/edit`} className="block">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {course.title}
                        </h3>
                        <Badge
                          variant={course.is_hosted ? 'success' : 'default'}
                          className="shrink-0"
                        >
                          {course.is_hosted ? 'Live' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-foreground-subtle">
                        <span>{course.enrolled || 0} students</span>
                        {course.completionRate > 0 && (
                          <span>{course.completionRate}% completion</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-foreground-subtle shrink-0" />
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
