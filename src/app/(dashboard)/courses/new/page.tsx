'use client';

import { useRouter } from 'next/navigation';
import { AIBuilderWizard } from '@/components/ai-builder/ai-builder-wizard';
import { createCourse, updateCourseContent } from '@/app/actions/courses';
import type { CourseContent } from '@/types/activities';

export default function NewCoursePage() {
  const router = useRouter();

  const handleComplete = async (content: CourseContent) => {
    // Create the course in Supabase
    const createResult = await createCourse(content.title || 'Untitled Course');
    if (createResult.error || !createResult.courseId) {
      alert(createResult.error || 'Failed to create course');
      return;
    }

    // Save the generated content
    const updateResult = await updateCourseContent(createResult.courseId, content);
    if (updateResult.error) {
      alert(updateResult.error);
      return;
    }

    // Navigate to the editor
    router.push(`/courses/${createResult.courseId}/edit`);
  };

  const handleCancel = () => {
    router.push('/courses');
  };

  return <AIBuilderWizard onComplete={handleComplete} onCancel={handleCancel} />;
}
