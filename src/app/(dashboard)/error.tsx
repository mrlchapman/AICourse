'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold text-text">Something went wrong</h2>
      <p className="text-text-secondary text-sm">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
