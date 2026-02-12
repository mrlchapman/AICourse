import { redirect } from 'next/navigation';
import { getCourse } from '@/app/actions/courses';
import { EditorShell } from '@/components/editor/editor-shell';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditPageProps) {
  const { id } = await params;
  const result = await getCourse(id);

  if (result.error || !result.course) {
    redirect('/courses');
  }

  const course = result.course;
  const content = course.content || { title: course.title, description: '', sections: [] };

  return <EditorShell courseId={id} initialContent={content} />;
}
