import { Bell, CreditCard, KeyRound, User, Users, type LucideIcon } from 'lucide-react';

export interface SettingsNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  children?: SettingsNavItem[];
}

export interface SettingsNavSection {
  title?: string;
  items: SettingsNavItem[];
}

export const settingsNav: SettingsNavSection[] = [
  {
    items: [
      { label: 'Perfil', href: '/settings/profile', icon: User },
      { label: 'Conta', href: '/settings/account/security', icon: KeyRound },
      { label: 'Notificações', href: '/settings/notifications', icon: Bell },
    ],
  },
  {
    title: 'Acesso',
    items: [
      { label: 'Planos e Assinaturas', href: '/settings/plans', icon: CreditCard },
      {
        label: 'Espaço de Trabalho',
        href: '/settings/workspace/members',
        icon: Users,
        children: [
          { label: 'Membros', href: '/settings/workspace/members' },
          { label: 'Convites', href: '/settings/workspace/invites' },
        ],
      },
    ],
  },
];
