import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "../components/reset-password-form";

interface ResetPasswordScreenProps {
  email: string
}

export function ResetPasswordScreen({ email }: ResetPasswordScreenProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Redefinir senha</CardTitle>
        <CardDescription>
          Digite o código enviado para seu email e escolha uma nova senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm email={email} />
      </CardContent>
    </Card>
  );
}
