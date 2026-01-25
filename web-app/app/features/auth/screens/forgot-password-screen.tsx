import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "../components/forgot-password-form";
import Link from "next/link";

export function ForgotPasswordScreen() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Esqueceu sua senha?</CardTitle>
        <CardDescription>
          Digite seu email para receber um código de recuperação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />

        <div className="mt-6 text-center text-sm">
          <Link href="/auth/login" className="text-primary hover:underline">
            Voltar para login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
