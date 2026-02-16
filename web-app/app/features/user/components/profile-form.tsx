'use client';

import { updateProfileAction } from '@/app/(protected)/settings/profile/actions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormToast } from '@/hooks/use-form-toast';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { User } from '../types/user.types';

interface ProfileFormProps {
  user: User;
}

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
        Salvar
      </Button>
    </div>
  );
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, null);
  useFormToast(state);

  return (
    <form action={formAction} className="space-y-8 w-full max-w-md">

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={user.fullName}
          placeholder="João Silva"
        />
        {state?.errors?.fullName && (
          <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Label htmlFor="email">Email</Label>
          {user.emailVerified ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Verificado
            </Badge>
          ) : (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Não verificado
            </Badge>
          )}
        </div>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          placeholder="joao@exemplo.com"
          disabled
        />
        {!user.emailVerified && (
          <Alert>
            <AlertDescription>
              Verifique seu email para ter acesso completo à plataforma.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Actions */}
      <FormActions />

    </form>
  );
}
