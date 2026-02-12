import { getCourse } from '@/app/actions/courses';
import { ManageCourseClient } from './manage-client';
import { redirect } from 'next/navigation';

interface ManagePageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageCoursePage({ params }: ManagePageProps) {
  const { id } = await params;
  const result = await getCourse(id);

  if (result.error || !result.course) {
    redirect('/courses');
  }

  return <ManageCourseClient course={result.course} />;
}
