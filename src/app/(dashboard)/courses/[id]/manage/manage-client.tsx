'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Copy,
  Plus,
  Trash2,
  Users,
  ArrowLeft,
  Link as LinkIcon,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import {
  publishCourse,
  unpublishCourse,
  generateInviteCode,
  getInviteCodes,
  deleteInviteCode,
  getCourseStudents,
} from '@/app/actions/teacher';

interface ManageCourseClientProps {
  course: any;
}

export function ManageCourseClient({ course: initialCourse }: ManageCourseClientProps) {
  const [course, setCourse] = useState(initialCourse);
  const [invites, setInvites] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [inviteResult, studentResult] = await Promise.all([
      getInviteCodes(course.id),
      getCourseStudents(course.id),
    ]);
    setInvites(inviteResult.invites || []);
    setStudents(studentResult.students || []);
    setLoading(false);
  }, [course.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleHosting = async () => {
    setIsPublishing(true);
    const result = course.is_hosted
      ? await unpublishCourse(course.id)
      : await publishCourse(course.id);

    if (result.success) {
      setCourse((prev: any) => ({
        ...prev,
        is_hosted: !prev.is_hosted,
        status: prev.is_hosted ? 'draft' : 'published',
      }));
    }
    setIsPublishing(false);
  };

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    const result = await generateInviteCode(course.id);
    if (result.success && result.invite) {
      setInvites((prev) => [result.invite, ...prev]);
    }
    setIsGeneratingCode(false);
  };

  const handleDeleteCode = async (inviteId: string) => {
    await deleteInviteCode(inviteId);
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyJoinUrl = (code: string) => {
    const url = `${window.location.origin}/join?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <Badge variant="default">Enrolled</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'passed':
        return <Badge variant="success">Passed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
          <p className="text-foreground-muted mt-0.5">Manage hosting, invites, and students</p>
        </div>
        <Badge variant={course.is_hosted ? 'success' : 'default'}>
          {course.is_hosted ? 'Published' : 'Draft'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hosting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Course Hosting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground-muted">
              {course.is_hosted
                ? 'Your course is live and accessible to students with an invite code.'
                : 'Publish your course to make it available for students.'}
            </p>
            <Button
              onClick={handleToggleHosting}
              loading={isPublishing}
              variant={course.is_hosted ? 'secondary' : 'primary'}
              className="w-full"
            >
              {course.is_hosted ? (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Unpublish Course
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Publish Course
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Invite Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Invite Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerateCode}
              loading={isGeneratingCode}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Generate New Code
            </Button>

            {invites.length === 0 ? (
              <p className="text-sm text-foreground-subtle text-center py-4">
                No invite codes yet. Generate one to share with students.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-hover"
                  >
                    <code className="text-sm font-mono font-bold text-foreground flex-1">
                      {invite.code}
                    </code>
                    <span className="text-xs text-foreground-subtle">
                      {invite.uses} used
                    </span>
                    <button
                      onClick={() => handleCopyCode(invite.code)}
                      className="p-1 rounded hover:bg-surface-active transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === invite.code ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-foreground-muted" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyJoinUrl(invite.code)}
                      className="p-1 rounded hover:bg-surface-active transition-colors"
                      title="Copy join URL"
                    >
                      <LinkIcon className="h-3.5 w-3.5 text-foreground-muted" />
                    </button>
                    <button
                      onClick={() => handleDeleteCode(invite.id)}
                      className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete code"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-foreground-subtle mx-auto mb-2" />
                <p className="text-sm text-foreground-muted">No students enrolled yet</p>
                <p className="text-xs text-foreground-subtle mt-1">
                  Share an invite code to get students started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Student
                      </th>
                      <th className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Score
                      </th>
                      <th className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Time Spent
                      </th>
                      <th className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Joined
                      </th>
                      <th className="text-left text-xs font-medium text-foreground-muted pb-3">
                        Last Active
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((enrollment: any) => (
                      <tr key={enrollment.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-medium">
                              {(enrollment.student?.display_name || enrollment.student?.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {enrollment.student?.display_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-foreground-subtle">
                                {enrollment.student?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">{getStatusBadge(enrollment.status)}</td>
                        <td className="py-3 pr-4 text-sm text-foreground">
                          {enrollment.final_score !== null
                            ? `${enrollment.final_score}%`
                            : '--'}
                        </td>
                        <td className="py-3 pr-4 text-sm text-foreground-muted">
                          {formatDuration(enrollment.total_time_spent)}
                        </td>
                        <td className="py-3 pr-4 text-sm text-foreground-muted">
                          {new Date(enrollment.joined_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-sm text-foreground-muted">
                          {new Date(enrollment.last_accessed_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
