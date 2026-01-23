'use client'

import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { verifyEmailAction, resendCodeAction } from '@/app/(pages)/auth/verify-email/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Verificando...' : 'Verificar email'}
    </Button>
  )
}

interface VerifyEmailFormProps {
  email: string
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [state, formAction] = useActionState(verifyEmailAction, null)
  const [resendState, setResendState] = useState<{ loading: boolean; message?: string; error?: string }>({
    loading: false,
  })

  const handleResend = async () => {
    setResendState({ loading: true })
    const result = await resendCodeAction(email)

    if (result.error) {
      setResendState({ loading: false, error: result.error })
    } else {
      setResendState({ loading: false, message: result.message })
    }
  }

  return (
    <div className="space-y-4">
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

        {/* Erro geral */}
        {state?.error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{state.error}</p>
          </div>
        )}

        <SubmitButton />
      </form>

      {/* Reenviar código */}
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={handleResend}
          disabled={resendState.loading}
        >
          {resendState.loading ? 'Reenviando...' : 'Não recebeu o código? Reenviar'}
        </Button>

        {resendState.message && (
          <p className="text-sm text-green-600 mt-2">{resendState.message}</p>
        )}

        {resendState.error && (
          <p className="text-sm text-red-600 mt-2">{resendState.error}</p>
        )}
      </div>
    </div>
  )
}
