'use client';

import { updateTenantAction } from '@/app/(protected)/settings/workspace/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormToast } from '@/hooks/use-form-toast';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Tenant } from '../types/workspace.types';

interface TenantFormProps {
  tenant: Tenant;
  canEdit: boolean;
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

export function TenantForm({ tenant, canEdit }: TenantFormProps) {
  const [state, formAction] = useActionState(updateTenantAction, null);
  useFormToast(state);

  const createdDate = new Date(tenant.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <form action={formAction} className="space-y-8 w-full max-w-md">

      {/* Tenant Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome do espaço de trabalho</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={tenant.name}
          placeholder="Minha Organização"
          disabled={!canEdit}
        />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Created At */}
      <div className="flex items-start gap-4">
        <div className="space-y-2 w-full">
          <Label htmlFor="createdAt">Criado em</Label>
          <Input
            id="createdAt"
            type="text"
            value={createdDate}
            disabled
          />
        </div>
        {/* Members Count */}
        <div className="space-y-2">
          <Label htmlFor="membersCount">Total de membros</Label>
          <Input
            id="membersCount"
            type="text"
            value={tenant.members?.total || 0}
            disabled
          />
        </div>
      </div>

      {/* Actions - only show for owners */}
      {canEdit && <FormActions />}

    </form>
  );
}
