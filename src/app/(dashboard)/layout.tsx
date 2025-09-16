
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  LayoutGrid,
  Scissors,
  Settings,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground"
              asChild
            >
              <Link href="/reports">
                <Scissors />
              </Link>
            </Button>
            <span className="text-lg font-semibold text-sidebar-primary">
              AlphaClub
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/reports')}
                tooltip="Relatórios"
              >
                <Link href="/reports">
                  <LayoutGrid />
                  <span>Relatórios</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/agenda')}
                tooltip="Agenda"
              >
                <Link href="/agenda">
                  <Calendar />
                  <span>Agenda</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/services')}
                tooltip="Serviços"
              >
                <Link href="/services">
                  <Scissors />
                  <span>Serviços</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/barbers')}
                tooltip="Barbeiros"
              >
                <Link href="/barbers">
                  <Users />
                  <span>Barbeiros</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/settings')}
                tooltip="Configurações"
              >
                <Link href="/settings">
                  <Settings />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b px-4 md:hidden">
            <Link href="/reports" className='flex items-center gap-2'>
                 <div className="p-1.5 bg-primary rounded-full text-primary-foreground">
                    <Scissors className="h-5 w-5" />
                </div>
                <span className="text-lg font-semibold text-primary">AlphaClub</span>
            </Link>
            <SidebarTrigger />
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
