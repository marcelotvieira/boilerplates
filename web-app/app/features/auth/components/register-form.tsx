'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerAction } from '@/app/(pages)/auth/register/actions';
import { useFormToast } from '@/hooks/use-form-toast';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Cadastrando...' : 'Criar conta'}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, null);
  useFormToast(state);

  return (
    <form action={formAction} className="space-y-4">
      {/* Nome completo */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="João Silva"
          required
        />
        {state?.errors?.fullName && (
          <p className="text-sm text-red-600">{state.errors.fullName[0]}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="joao@exemplo.com"
          required
        />
        {state?.errors?.email && (
          <p className="text-sm text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
        {state?.errors?.password && (
          <p className="text-sm text-red-600">{state.errors.password[0]}</p>
        )}
      </div>

      {/* Confirmar senha */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
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

      <SubmitButton />
    </form>
  );
}
