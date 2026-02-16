import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VerifyEmailForm } from '@/app/features/auth/components/verify-email-form';

interface VerifyEmailPageProps {
  searchParams: Promise<{
    email?: string
  }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;

  // Se não tem email no query param, redireciona para registro
  if (!params.email) {
    redirect('/auth/register');
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Verificar email</CardTitle>
        <CardDescription>
          Enviamos um código de verificação para seu email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyEmailForm email={params.email} />
      </CardContent>
    </Card>
  );
}
