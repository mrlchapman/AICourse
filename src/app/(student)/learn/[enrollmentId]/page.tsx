import { getEnrollment } from '@/app/actions/student';
import CoursePlayer from '@/components/player/course-player';
import Link from 'next/link';

interface LearnPageProps {
  params: Promise<{ enrollmentId: string }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { enrollmentId } = await params;

  const result = await getEnrollment(enrollmentId);

  if (result.error || !result.course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Unable to load course</h1>
          <p className="text-foreground-muted mb-6">
            We couldn&apos;t find the course you&apos;re looking for, or you don&apos;t have permission to access it.
          </p>
          <Link
            href="/my-courses"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  const courseContent = result.course.content;
  const isHosted = result.course.is_hosted !== false;

  if (!isHosted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md bg-surface border border-border p-8 rounded-2xl shadow-sm">
          <div className="text-5xl mb-6">🏁</div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">Course Ended</h1>
          <p className="text-foreground-muted mb-6">
            &ldquo;{result.course.title}&rdquo; is no longer active.
          </p>

          <div className="bg-surface-hover rounded-xl p-4 mb-8">
            <div className="text-sm text-foreground-subtle uppercase tracking-widest mb-1">Your Result</div>
            <div className="text-3xl font-mono font-bold text-foreground mb-2">
              {result.enrollment?.final_score ?? 0}%
            </div>
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
              result.enrollment?.status === 'completed' || result.enrollment?.status === 'passed'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {result.enrollment?.status === 'completed' || result.enrollment?.status === 'passed' ? 'COMPLETED' : 'INCOMPLETE'}
            </div>
          </div>

          <Link
            href="/my-courses"
            className="block w-full py-3 bg-surface-hover hover:bg-border rounded-lg font-medium transition-colors text-foreground text-center"
          >
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <CoursePlayer
        enrollment={result.enrollment}
        courseContent={courseContent}
      />
    </div>
  );
}
