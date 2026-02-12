'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { createCourse } from '@/app/actions/courses';

export function CreateCourseButton() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const result = await createCourse('Untitled Course');
      if (result.error || !result.courseId) {
        alert(result.error || 'Failed to create course');
        return;
      }
      router.push(`/courses/${result.courseId}/edit`);
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Button size="sm" onClick={handleCreate} loading={creating}>
      <Plus className="h-4 w-4" />
      New Course
    </Button>
  );
}
