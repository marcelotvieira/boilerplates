import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/app/features/auth/components/login-form';
import Link from 'next/link';

interface LoginPageProps {
  searchParams: Promise<{
    reset?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const showResetSuccess = params.reset === 'success';

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showResetSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">
              Senha redefinida com sucesso! Faça login com sua nova senha.
            </p>
          </div>
        )}

        <LoginForm />

        <div className="mt-6 space-y-2 text-center text-sm">
          <div>
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
          <div>
            Não tem uma conta?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Criar conta
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
