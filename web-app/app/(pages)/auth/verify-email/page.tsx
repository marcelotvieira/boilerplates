import { redirect } from 'next/navigation'
import { VerifyEmailScreen } from '@/app/features/auth/screens/verify-email-screen'

interface VerifyEmailPageProps {
  searchParams: Promise<{
    email?: string
  }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams

  // Se não tem email no query param, redireciona para registro
  if (!params.email) {
    redirect('/auth/register')
  }

  return <VerifyEmailScreen email={params.email} />
}
