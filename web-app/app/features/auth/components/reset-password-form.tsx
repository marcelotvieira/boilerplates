'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordAction } from '@/app/(pages)/auth/reset-password/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Redefinindo...' : 'Redefinir senha'}
    </Button>
  )
}

interface ResetPasswordFormProps {
  email: string
}

export function ResetPasswordForm({ email }: ResetPasswordFormProps) {
  const [state, formAction] = useActionState(resetPasswordAction, null)

  return (
    <form action={formAction} className="space-y-4">
      {/* Email (hidden) */}
      <input type="hidden" name="email" value={email} />

      {/* Código */}
      <div className="space-y-2">
        <Label htmlFor="code">Código de verificação</Label>
        <Input
          id="code"
          name="code"
          type="text"
          placeholder="000000"
          maxLength={6}
          pattern="\d{6}"
          required
          className="text-center text-2xl tracking-widest"
        />
        {state?.errors?.code && (
          <p className="text-sm text-red-600">{state.errors.code[0]}</p>
        )}
        <p className="text-xs text-gray-600">
          Digite o código de 6 dígitos enviado para {email}
        </p>
      </div>

      {/* Nova senha */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          required
        />
        {state?.errors?.newPassword && (
          <p className="text-sm text-red-600">{state.errors.newPassword[0]}</p>
        )}
      </div>

      {/* Confirmar senha */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
        />
        {state?.errors?.confirmPassword && (
          <p className="text-sm text-red-600">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      {/* Erro geral */}
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
