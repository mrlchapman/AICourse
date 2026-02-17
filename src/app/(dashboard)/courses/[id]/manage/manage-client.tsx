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
  Eye,
  AlertTriangle,
  Calendar,
  BarChart3,
  Clock,
  Award,
  TrendingUp,
  X,
  CheckCircle,
  XCircle,
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
  removeStudent,
  updateCourseDeadlines,
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

  // Student detail modal
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Unhost confirmation
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);

  // Remove student confirmation
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Deadline settings
  const [deadlineEnabled, setDeadlineEnabled] = useState(initialCourse.has_deadline || false);
  const [courseDeadline, setCourseDeadline] = useState(initialCourse.course_deadline || '');
  const [submissionDeadline, setSubmissionDeadline] = useState(initialCourse.submission_deadline || '');
  const [savingDeadlines, setSavingDeadlines] = useState(false);

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

  // Analytics computations
  const totalEnrolled = students.length;
  const completedStudents = students.filter(
    (s) => s.status === 'completed' || s.status === 'passed'
  );
  const completionRate = totalEnrolled > 0
    ? Math.round((completedStudents.length / totalEnrolled) * 100)
    : 0;
  const scoredStudents = students.filter((s) => s.final_score !== null);
  const averageScore = scoredStudents.length > 0
    ? Math.round(scoredStudents.reduce((sum: number, s: any) => sum + s.final_score, 0) / scoredStudents.length)
    : 0;
  const timedStudents = completedStudents.filter((s) => s.total_time_spent > 0);
  const averageTime = timedStudents.length > 0
    ? Math.round(timedStudents.reduce((sum: number, s: any) => sum + s.total_time_spent, 0) / timedStudents.length)
    : 0;

  const handleToggleHosting = async () => {
    if (course.is_hosted && !confirmUnpublish) {
      setConfirmUnpublish(true);
      return;
    }

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
      setConfirmUnpublish(false);
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

  const handleRemoveStudent = async (enrollmentId: string) => {
    setIsRemoving(true);
    const result = await removeStudent(enrollmentId);
    if (result.success) {
      setStudents((prev) => prev.filter((s) => s.id !== enrollmentId));
    }
    setConfirmRemoveId(null);
    setIsRemoving(false);
  };

  const handleSaveDeadlines = async () => {
    setSavingDeadlines(true);
    const result = await updateCourseDeadlines(course.id, {
      has_deadline: deadlineEnabled,
      course_deadline: deadlineEnabled ? courseDeadline || null : null,
      submission_deadline: deadlineEnabled ? submissionDeadline || null : null,
    });
    if (result.success) {
      setCourse((prev: any) => ({
        ...prev,
        has_deadline: deadlineEnabled,
        course_deadline: deadlineEnabled ? courseDeadline || null : null,
        submission_deadline: deadlineEnabled ? submissionDeadline || null : null,
      }));
    }
    setSavingDeadlines(false);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatDatetimeLocal = (iso: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toISOString().slice(0, 16);
    } catch {
      return '';
    }
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
          aria-label="Back to editor"
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

      {/* Analytics Summary Cards */}
      {!loading && students.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" aria-label="Course analytics">
          <div className="bg-surface border border-border rounded-xl p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-2 text-foreground-muted text-xs font-medium mb-1">
              <Users className="h-3.5 w-3.5" />
              Total Enrolled
            </div>
            <p className="text-2xl font-bold text-foreground">{totalEnrolled}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 border-l-4 border-l-green-500">
            <div className="flex items-center gap-2 text-foreground-muted text-xs font-medium mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Completion Rate
            </div>
            <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2 text-foreground-muted text-xs font-medium mb-1">
              <Award className="h-3.5 w-3.5" />
              Average Score
            </div>
            <p className="text-2xl font-bold text-foreground">
              {scoredStudents.length > 0 ? `${averageScore}%` : '--'}
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-2 text-foreground-muted text-xs font-medium mb-1">
              <Clock className="h-3.5 w-3.5" />
              Average Time
            </div>
            <p className="text-2xl font-bold text-foreground">
              {timedStudents.length > 0 ? formatDuration(averageTime) : '--'}
            </p>
          </div>
        </div>
      )}

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

            {/* Unhost Confirmation */}
            {confirmUnpublish ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg space-y-3" role="alert">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    This will remove student access and delete all enrollment data. This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmUnpublish(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={isPublishing}
                    onClick={handleToggleHosting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Yes, Unpublish
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleToggleHosting}
                loading={isPublishing}
                variant={course.is_hosted ? 'secondary' : 'primary'}
                className="w-full"
              >
                <Globe className="h-4 w-4 mr-2" />
                {course.is_hosted ? 'Unpublish Course' : 'Publish Course'}
              </Button>
            )}

            {/* Deadline Settings */}
            {course.is_hosted && (
              <div className="border-t border-border pt-4 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4" />
                    Enforce Deadlines
                  </span>
                  <button
                    role="switch"
                    aria-checked={deadlineEnabled}
                    aria-label="Toggle deadline enforcement"
                    onClick={() => setDeadlineEnabled(!deadlineEnabled)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      deadlineEnabled ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                        deadlineEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </label>

                {deadlineEnabled && (
                  <div className="space-y-3 pl-6">
                    <div>
                      <label htmlFor="course-deadline" className="block text-xs font-medium text-foreground-muted mb-1">
                        Course Deadline
                      </label>
                      <input
                        id="course-deadline"
                        type="datetime-local"
                        value={formatDatetimeLocal(courseDeadline)}
                        onChange={(e) => setCourseDeadline(e.target.value ? new Date(e.target.value).toISOString() : '')}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <p className="text-xs text-foreground-subtle mt-1">When the course becomes inaccessible</p>
                    </div>
                    <div>
                      <label htmlFor="submission-deadline" className="block text-xs font-medium text-foreground-muted mb-1">
                        Submission Deadline
                      </label>
                      <input
                        id="submission-deadline"
                        type="datetime-local"
                        value={formatDatetimeLocal(submissionDeadline)}
                        onChange={(e) => setSubmissionDeadline(e.target.value ? new Date(e.target.value).toISOString() : '')}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <p className="text-xs text-foreground-subtle mt-1">When new submissions close</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={savingDeadlines}
                      onClick={handleSaveDeadlines}
                    >
                      Save Deadlines
                    </Button>
                  </div>
                )}
              </div>
            )}
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
              aria-label="Generate a new invite code"
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
                      className="p-1 rounded hover:bg-surface-active transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      aria-label={`Copy invite code ${invite.code}`}
                    >
                      {copiedCode === invite.code ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-foreground-muted" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyJoinUrl(invite.code)}
                      className="p-1 rounded hover:bg-surface-active transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      aria-label={`Copy join URL for code ${invite.code}`}
                    >
                      <LinkIcon className="h-3.5 w-3.5 text-foreground-muted" />
                    </button>
                    <button
                      onClick={() => handleDeleteCode(invite.id)}
                      className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      aria-label={`Delete invite code ${invite.code}`}
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
              <div className="flex items-center justify-center py-8" aria-live="polite">
                <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
                <span className="sr-only">Loading students...</span>
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
                <table className="w-full" role="table" aria-label="Enrolled students">
                  <thead>
                    <tr className="border-b border-border">
                      <th scope="col" className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Student
                      </th>
                      <th scope="col" className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Status
                      </th>
                      <th scope="col" className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Score
                      </th>
                      <th scope="col" className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Time Spent
                      </th>
                      <th scope="col" className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Joined
                      </th>
                      <th scope="col" className="text-left text-xs font-medium text-foreground-muted pb-3 pr-4">
                        Last Active
                      </th>
                      <th scope="col" className="text-right text-xs font-medium text-foreground-muted pb-3">
                        Actions
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
                        <td className="py-3 pr-4 text-sm text-foreground-muted">
                          {new Date(enrollment.last_accessed_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedStudent(enrollment)}
                              className="p-1.5 rounded hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                              aria-label={`View details for ${enrollment.student?.display_name || 'student'}`}
                            >
                              <Eye className="h-3.5 w-3.5 text-foreground-muted" />
                            </button>

                            {confirmRemoveId === enrollment.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setConfirmRemoveId(null)}
                                  className="p-1.5 rounded hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                  aria-label="Cancel removing student"
                                >
                                  <X className="h-3.5 w-3.5 text-foreground-muted" />
                                </button>
                                <button
                                  onClick={() => handleRemoveStudent(enrollment.id)}
                                  disabled={isRemoving}
                                  className="px-2 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:opacity-50"
                                  aria-label="Confirm remove student"
                                >
                                  {isRemoving ? 'Removing...' : 'Remove'}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmRemoveId(enrollment.id)}
                                className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                aria-label={`Remove ${enrollment.student?.display_name || 'student'} from course`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
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

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudent(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Student details for ${selectedStudent.student?.display_name || 'student'}`}
        >
          <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold">
                  {(selectedStudent.student?.display_name || selectedStudent.student?.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedStudent.student?.display_name || 'Unknown Student'}
                  </h2>
                  <p className="text-sm text-foreground-muted">{selectedStudent.student?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Close student details"
              >
                <X className="h-5 w-5 text-foreground-muted" />
              </button>
            </div>

            {/* Meta Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 border-b border-border bg-surface-hover/50">
              <div>
                <p className="text-xs text-foreground-subtle">Joined</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(selectedStudent.joined_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-subtle">Completed</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedStudent.completed_at
                    ? new Date(selectedStudent.completed_at).toLocaleDateString()
                    : '--'}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-subtle">Last Active</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(selectedStudent.last_accessed_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-subtle">Device</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedStudent.last_device || '--'}
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 p-6 border-b border-border">
              <div className="text-center">
                <p className="text-xs text-foreground-subtle mb-1">Active Time</p>
                <p className="text-lg font-bold text-foreground">
                  {formatDuration(selectedStudent.total_time_spent)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-foreground-subtle mb-1">Revisits</p>
                <p className="text-lg font-bold text-foreground">
                  {selectedStudent.revisits ?? 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-foreground-subtle mb-1">Final Score</p>
                <p className="text-lg font-bold text-foreground">
                  {selectedStudent.final_score !== null ? `${selectedStudent.final_score}%` : '--'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-foreground-subtle mb-1">Status</p>
                <div className="flex justify-center">{getStatusBadge(selectedStudent.status)}</div>
              </div>
            </div>

            {/* Response Log */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Response Log
              </h3>
              {(!selectedStudent.responses || selectedStudent.responses.length === 0) ? (
                <div className="text-center py-8">
                  <p className="text-sm text-foreground-muted">
                    No quiz or knowledge check responses recorded yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedStudent.responses
                    .filter((r: any) => r.activity_id && !r._suspend_data)
                    .map((response: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover text-sm"
                      >
                        {response.is_correct ? (
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {response.activity_id}
                          </p>
                          {response.selected_id && (
                            <p className="text-xs text-foreground-subtle truncate">
                              Selected: {response.selected_id}
                            </p>
                          )}
                        </div>
                        {response.points !== undefined && response.points !== null && (
                          <span className="text-xs font-mono text-foreground-muted">
                            {response.points}pts
                          </span>
                        )}
                        {response.timestamp && (
                          <span className="text-xs text-foreground-subtle">
                            {new Date(response.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
