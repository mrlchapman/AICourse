'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { joinCourse } from '@/app/actions/student';

function JoinPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 4) return;
    setLoading(true);
    setError('');

    const result = await joinCourse(code);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.success && result.enrollmentId) {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/learn/${result.enrollmentId}`);
      }, 1500);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join a Course</h1>
          <p className="text-foreground-muted mt-1">Enter your invite code to get started</p>
        </div>

        <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-foreground mb-1">Enrolled Successfully!</h2>
              <p className="text-sm text-foreground-muted">Redirecting to your course...</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="ENTER CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center text-2xl tracking-widest font-mono uppercase"
                  maxLength={12}
                />

                {error && (
                  <div className="p-3 bg-danger-light border border-danger/20 rounded-lg text-danger text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={code.length < 4}
                  loading={loading}
                >
                  Join Course
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-foreground-muted hover:text-foreground">
                  Back to Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-secondary flex items-center justify-center text-foreground-muted">Loading...</div>}>
      <JoinPageContent />
    </Suspense>
  );
}
