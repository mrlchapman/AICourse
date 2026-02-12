import { getUserProfile } from '@/app/actions/auth';
import { getTeacherStats } from '@/app/actions/teacher';
import { redirect } from 'next/navigation';
import { DashboardHome } from '@/components/dashboard/dashboard-home';

export default async function DashboardPage() {
  const profile = await getUserProfile();

  if (!profile) redirect('/login');

  // Students go to their dashboard
  if (profile.role === 'student') {
    redirect('/my-courses');
  }

  const stats = await getTeacherStats();

  return (
    <DashboardHome
      user={profile}
      stats={{
        courseCount: stats.courses?.length || 0,
        studentCount: stats.totalStudents || 0,
        completionRate: stats.completionRate || 0,
        recentCourses: (stats.courses || []).slice(0, 5),
      }}
    />
  );
}
