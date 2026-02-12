import { redirect } from 'next/navigation';
import { getUserProfile } from '@/app/actions/auth';

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile();

  if (!profile) {
    redirect('/login');
  }

  return <>{children}</>;
}
