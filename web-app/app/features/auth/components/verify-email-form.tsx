"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyEmailAction, resendCodeAction } from "@/app/(pages)/auth/verify-email/actions";
import { useFormToast } from "@/hooks/use-form-toast";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Verificando..." : "Verificar email"}
    </Button>
  );
}

interface VerifyEmailFormProps {
  email: string
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [state, formAction] = useActionState(verifyEmailAction, null);
  const [resendLoading, setResendLoading] = useState(false);
  useFormToast(state);

  const handleResend = async () => {
    setResendLoading(true);
    const result = await resendCodeAction(email);
    setResendLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
    }
  };

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

        <SubmitButton />
      </form>

      {/* Reenviar código */}
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={handleResend}
          disabled={resendLoading}
        >
          {resendLoading ? "Reenviando..." : "Não recebeu o código? Reenviar"}
        </Button>
      </div>
    </div>
  );
}
