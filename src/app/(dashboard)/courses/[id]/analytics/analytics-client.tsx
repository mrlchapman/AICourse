'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Award,
  Clock,
  ChevronDown,
  ChevronRight,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';

interface CourseAnalyticsClientProps {
  course: any;
  students: any[];
}

export function CourseAnalyticsClient({ course, students }: CourseAnalyticsClientProps) {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Calculate aggregate stats
  const totalStudents = students.length;
  const completedStudents = students.filter(
    (s) => s.status === 'completed' || s.status === 'passed'
  ).length;
  const completionRate = totalStudents > 0
    ? Math.round((completedStudents / totalStudents) * 100)
    : 0;
  const scoredStudents = students.filter((s) => s.final_score !== null);
  const avgScore = scoredStudents.length > 0
    ? Math.round(
        scoredStudents.reduce((sum: number, s: any) => sum + s.final_score, 0) /
          scoredStudents.length
      )
    : 0;
  const avgTimeSpent = totalStudents > 0
    ? Math.round(
        students.reduce((sum: number, s: any) => sum + (s.total_time_spent || 0), 0) /
          totalStudents
      )
    : 0;

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0m';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return <Badge variant="success">{status === 'passed' ? 'Passed' : 'Completed'}</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge>Enrolled</Badge>;
    }
  };

  const parseDevice = (ua: string | null) => {
    if (!ua) return 'Unknown';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Mac')) return 'Mac';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Linux')) return 'Linux';
    return 'Other';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/courses/${course.id}/edit`}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground-muted" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
          <p className="text-foreground-muted mt-0.5">Course Analytics</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                <p className="text-xs text-foreground-muted">Enrolled</p>
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
                <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
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
                  {scoredStudents.length > 0 ? `${avgScore}%` : '--'}
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
                <p className="text-2xl font-bold text-foreground">{formatDuration(avgTimeSpent)}</p>
                <p className="text-xs text-foreground-muted">Avg. Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students ({totalStudents})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-8 w-8 text-foreground-subtle mx-auto mb-2" />
              <p className="text-foreground-muted">No students enrolled yet</p>
              <p className="text-xs text-foreground-subtle mt-1">
                Share an invite code to get started
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-foreground-muted border-b border-border">
                <div className="col-span-3">Student</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Score</div>
                <div className="col-span-2">Time Spent</div>
                <div className="col-span-2">Joined</div>
                <div className="col-span-2">Last Active</div>
              </div>

              {students.map((enrollment: any) => {
                const isExpanded = expandedStudent === enrollment.id;
                const responses = enrollment.responses || [];

                return (
                  <div key={enrollment.id}>
                    {/* Row */}
                    <div
                      className="grid grid-cols-12 gap-2 px-3 py-3 items-center rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
                      onClick={() => setExpandedStudent(isExpanded ? null : enrollment.id)}
                    >
                      <div className="col-span-3 flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                        )}
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                          {(enrollment.student?.display_name || enrollment.student?.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {enrollment.student?.display_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-foreground-subtle truncate">
                            {enrollment.student?.email}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2">{getStatusBadge(enrollment.status)}</div>
                      <div className="col-span-1 text-sm text-foreground">
                        {enrollment.final_score !== null ? `${enrollment.final_score}%` : '--'}
                      </div>
                      <div className="col-span-2 text-sm text-foreground-muted">
                        {formatDuration(enrollment.total_time_spent)}
                      </div>
                      <div className="col-span-2 text-sm text-foreground-muted">
                        {new Date(enrollment.joined_at).toLocaleDateString()}
                      </div>
                      <div className="col-span-2 text-sm text-foreground-muted">
                        {enrollment.last_accessed_at
                          ? new Date(enrollment.last_accessed_at).toLocaleDateString()
                          : '--'}
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="ml-12 mr-3 mb-3 p-4 rounded-lg bg-surface border border-border/50">
                        {/* Detail Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-surface-hover">
                            <p className="text-xs text-foreground-subtle mb-1">Time to Complete</p>
                            <p className="text-sm font-medium text-foreground">
                              {enrollment.time_to_complete
                                ? formatDuration(enrollment.time_to_complete)
                                : '--'}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-surface-hover">
                            <div className="flex items-center gap-1.5 mb-1">
                              <RefreshCw className="h-3 w-3 text-foreground-subtle" />
                              <p className="text-xs text-foreground-subtle">Revisits</p>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              {enrollment.revisits || 0}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-surface-hover">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Monitor className="h-3 w-3 text-foreground-subtle" />
                              <p className="text-xs text-foreground-subtle">Device</p>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              {parseDevice(enrollment.last_device)}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-surface-hover">
                            <p className="text-xs text-foreground-subtle mb-1">Completed At</p>
                            <p className="text-sm font-medium text-foreground">
                              {enrollment.completed_at
                                ? new Date(enrollment.completed_at).toLocaleDateString()
                                : '--'}
                            </p>
                          </div>
                        </div>

                        {/* Responses */}
                        {responses.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-foreground-muted mb-2">
                              Responses ({responses.length})
                            </h4>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {responses.map((r: any, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded bg-surface-hover"
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full shrink-0 ${
                                      r.is_correct ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                  />
                                  <span className="text-foreground-muted truncate flex-1">
                                    {r.activity_id}
                                  </span>
                                  {r.points !== undefined && (
                                    <span className="text-foreground-subtle">
                                      {r.points} pts
                                    </span>
                                  )}
                                  {r.timestamp && (
                                    <span className="text-foreground-subtle">
                                      {new Date(r.timestamp).toLocaleTimeString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {responses.length === 0 && (
                          <p className="text-xs text-foreground-subtle text-center py-2">
                            No quiz responses recorded yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
