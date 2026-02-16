'use client';

import * as React from 'react';
import {
  GalleryVerticalEnd,
  LayoutDashboard,
  Settings2,
} from 'lucide-react';

import { NavMain } from '@/components/sidebar/nav-main';
import { NavUser } from '@/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

// Dados de navegação
const navPainel = [
  {
    title: 'Visão Geral',
    url: '/panel',
    icon: LayoutDashboard,
    isActive: true,
  },
];

const navGerenciar = [
  {
    title: 'Configurações',
    url: '/settings/general',
    icon: Settings2,
    isActive: false,
    items: [
      { title: 'Geral', url: '/settings/general' },
    ],
  },
];

const defaultUser = {
  name: 'Usuário',
  email: 'usuario@exemplo.com',
  avatar: '',
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const userData = user
    ? { ...user, avatar: user.avatar || '' }
    : defaultUser;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/panel">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Painel" items={navPainel} />
        <NavMain label="Gerenciar" items={navGerenciar} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
