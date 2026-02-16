import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();

  if (session) {
    redirect('/panel');
  }

  return (
    <div className="panel-surface flex min-h-screen items-center justify-center px-4">
      {children}
    </div>
  );
}
