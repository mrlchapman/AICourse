'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Globe, Clock, MoreVertical, Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { deleteCourse, duplicateCourse } from '@/app/actions/courses';

interface CourseCardProps {
  course: {
    id: string;
    title: string | null;
    description: string | null;
    status: string | null;
    is_hosted: boolean;
    last_edited_at: string | null;
    created_at: string;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteCourse(course.id);
    setShowMenu(false);
    setConfirmDelete(false);
    router.refresh();
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    await duplicateCourse(course.id);
    setShowMenu(false);
    setDuplicating(false);
    router.refresh();
  };

  return (
    <div className="relative group">
      <Link href={`/courses/${course.id}/edit`}>
        <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {course.title || 'Untitled Course'}
              </h3>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {course.is_hosted && (
                  <span className="p-1 text-green-600" title="Published">
                    <Globe className="h-3.5 w-3.5" />
                  </span>
                )}
                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                  course.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {course.status || 'draft'}
                </span>
              </div>
            </div>

            {course.description && (
              <p className="text-xs text-foreground-muted line-clamp-2 mb-3">
                {course.description}
              </p>
            )}

            <div className="flex items-center gap-1 text-[10px] text-foreground-subtle">
              <Clock className="h-3 w-3" />
              {course.last_edited_at
                ? `Edited ${new Date(course.last_edited_at).toLocaleDateString()}`
                : `Created ${new Date(course.created_at).toLocaleDateString()}`}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Menu button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu((v) => !v);
          setConfirmDelete(false);
        }}
        className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-all z-10"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => { setShowMenu(false); setConfirmDelete(false); }} />
          <div className="absolute top-10 right-3 bg-surface border border-border rounded-lg shadow-xl z-30 overflow-hidden min-w-[140px]">
            {confirmDelete ? (
              <div className="p-3 space-y-2">
                <p className="text-xs text-foreground font-medium">Delete this course?</p>
                <p className="text-[10px] text-foreground-muted">This cannot be undone.</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 px-2 py-1 text-xs rounded-md border border-border hover:bg-surface-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleDuplicate}
                  disabled={duplicating}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {duplicating ? 'Duplicating...' : 'Duplicate'}
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete course
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
