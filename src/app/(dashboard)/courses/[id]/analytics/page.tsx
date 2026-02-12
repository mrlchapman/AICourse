import { getCourse } from '@/app/actions/courses';
import { getCourseStudents } from '@/app/actions/teacher';
import { redirect } from 'next/navigation';
import { CourseAnalyticsClient } from './analytics-client';

interface AnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseAnalyticsPage({ params }: AnalyticsPageProps) {
  const { id } = await params;
  const [courseResult, studentsResult] = await Promise.all([
    getCourse(id),
    getCourseStudents(id),
  ]);

  if (courseResult.error || !courseResult.course) {
    redirect('/courses');
  }

  return (
    <CourseAnalyticsClient
      course={courseResult.course}
      students={studentsResult.students || []}
    />
  );
}
