import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/app/features/auth/components/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para criar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />

        <div className="mt-4 text-center text-sm">
          Já tem uma conta?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Fazer login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
