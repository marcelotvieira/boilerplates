import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateInviteForm } from './create-invite-form';
import { UserPlus } from 'lucide-react';

interface CreateInviteDialogProps {
  triggerLabel: string;
  triggerAs?: 'button' | 'menuitem';
}

export function CreateInviteDialog({
  triggerLabel,
  triggerAs = 'button',
}: CreateInviteDialogProps) {
  return (
    <Dialog>
      {triggerAs === 'button' && (
        <DialogTrigger asChild>
          <Button size="sm" className="flex items-center gap-2">
            <UserPlus />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="!w-full !max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <UserPlus
              size={24}
              className="text-primary-foreground bg-primary/70 p-1 rounded-br-xl"
            />
            Convidar
          </DialogTitle>
          <DialogDescription>
            Envie um convite para adicionar um novo membro
            ao espaço de trabalho.
          </DialogDescription>
        </DialogHeader>
        <CreateInviteForm />
      </DialogContent>
    </Dialog>
  );
}
