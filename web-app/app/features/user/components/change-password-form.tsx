'use client';

import {
  changePasswordAction,
} from '@/app/(protected)/settings/account/security/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormToast } from '@/hooks/use-form-toast';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

function FormActions() {
  const { pending } = useFormStatus();

  return (
    <div className="flex gap-2 justify-end">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
      >
        Cancelar
      </Button>
      <Button type="submit" loading={pending}>
        Alterar senha
      </Button>
    </div>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(
    changePasswordAction,
    null,
  );

  useFormToast(state);

  return (
    <form action={formAction} className="space-y-8 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Senha atual</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="Digite sua senha atual"
          required
        />
        {state?.errors?.currentPassword && (
          <p className="text-sm text-destructive">
            {state.errors.currentPassword[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="Digite a nova senha"
          required
        />
        {state?.errors?.newPassword && (
          <p className="text-sm text-destructive">
            {state.errors.newPassword[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirme a nova senha"
          required
        />
        {state?.errors?.confirmPassword && (
          <p className="text-sm text-destructive">
            {state.errors.confirmPassword[0]}
          </p>
        )}
      </div>

      <FormActions />
    </form>
  );
}
