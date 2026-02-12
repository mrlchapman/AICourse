import { redirect } from 'next/navigation';
import { getUserProfile } from '@/app/actions/auth';
import { Sidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-secondary">
      <Sidebar user={profile} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
