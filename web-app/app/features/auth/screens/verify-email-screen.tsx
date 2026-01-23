import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VerifyEmailForm } from '../components/verify-email-form'

interface VerifyEmailScreenProps {
  email: string
}

export function VerifyEmailScreen({ email }: VerifyEmailScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verificar email</CardTitle>
          <CardDescription>
            Enviamos um código de verificação para seu email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyEmailForm email={email} />
        </CardContent>
      </Card>
    </div>
  )
}
