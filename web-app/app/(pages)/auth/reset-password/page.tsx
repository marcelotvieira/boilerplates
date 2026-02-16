import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPasswordForm } from '@/app/features/auth/components/reset-password-form';

interface ResetPasswordPageProps {
  searchParams: {
    email?: string
  }
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  // Se não tem email no query param, redireciona para forgot-password
  if (!searchParams.email) {
    redirect('/auth/forgot-password');
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Redefinir senha</CardTitle>
        <CardDescription>
          Digite o código enviado para seu email e escolha uma nova senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm email={searchParams.email} />
      </CardContent>
    </Card>
  );
}
