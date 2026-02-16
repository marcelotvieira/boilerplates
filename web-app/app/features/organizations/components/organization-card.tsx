'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Crown, Shield, User } from 'lucide-react';
import type { OrganizationMembership } from '../types/organization.types';

interface OrganizationCardProps {
  membership: OrganizationMembership;
}

// Role icon mapping
const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
};

// Role label mapping
const roleLabels = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
};

// Status label mapping
const statusLabels = {
  ACTIVE: 'Ativa',
  SUSPENDED: 'Suspensa',
  DELETED: 'Excluída',
};

// Plan label mapping
const planLabels = {
  FREE: 'Gratuito',
  ESSENCIAL: 'Essencial',
  PRO: 'Profissional',
};

export function OrganizationCard({ membership }: OrganizationCardProps) {
  const { tenant, role, isDefault } = membership;
  const RoleIcon = roleIcons[role];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{tenant.name}</CardTitle>
              {isDefault && (
                <Badge variant="outline" className="text-xs">
                  Padrão
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RoleIcon className="h-4 w-4" />
              <span>{roleLabels[role]}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
              {!isDefault && (
                <DropdownMenuItem>Definir como padrão</DropdownMenuItem>
              )}
              <DropdownMenuItem>Gerenciar membros</DropdownMenuItem>
              {role === 'OWNER' && (
                <DropdownMenuItem className="text-destructive">
                  Excluir organização
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Plano:</span>
            <Badge variant="outline">{planLabels[tenant.planSlug]}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <Badge
              variant={tenant.status === 'ACTIVE' ? 'outline' : 'destructive'}
              className={
                tenant.status === 'ACTIVE'
                  ? 'text-green-600 border-green-600'
                  : ''
              }
            >
              {statusLabels[tenant.status]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
