'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { useFormToast } from '@/hooks/use-form-toast';
import {
  createInviteAction,
  revalidateInvites,
} from '@/app/(protected)/settings/workspace/actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending}>
      Enviar convite
    </Button>
  );
}

export function CreateInviteForm() {
  const [state, formAction] = useActionState(
    createInviteAction,
    null,
  );

  useFormToast(state);

  useEffect(() => {
    if (state?.success) {
      startTransition(() => {
        revalidateInvites();
      });
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="invite-email">Email</Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          placeholder="nome@exemplo.com"
          required
        />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-role">Cargo</Label>
        <Select name="role" defaultValue="MEMBER">
          <SelectTrigger id="invite-role" className="w-full">
            <SelectValue placeholder="Selecione um cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEMBER">Membro</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
        {state?.errors?.role && (
          <p className="text-sm text-destructive">
            {state.errors.role[0]}
          </p>
        )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <SubmitButton />
      </DialogFooter>
    </form>
  );
}
