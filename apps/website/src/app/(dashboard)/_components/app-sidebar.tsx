'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, LayoutDashboard, Users, ShieldCheck, Settings2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';

const navItems: {
    title: string;
    href?: string;
    icon: LucideIcon;
    items?: { title: string; href: string; icon: LucideIcon }[];
}[] = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'User Management',
        icon: Users,
        items: [
            { title: 'Users', href: '/user-management/users', icon: Users },
            { title: 'Roles', href: '/user-management/roles', icon: ShieldCheck },
            { title: 'Role Management', href: '/user-management/role-management', icon: Settings2 },
        ],
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user.roles.includes('ADMIN');

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <LayoutDashboard className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Starter Template</span>
                                    <span className="truncate text-xs text-muted-foreground">Dashboard</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.filter((item) => item.title !== 'User Management' || isAdmin).map((item) => (
                                <SidebarMenuItem key={item.href ?? item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href ?? item.items?.[0].href ?? '/dashboard'}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {item.items && (
                                        <SidebarMenu className="ml-4 border-l border-border pl-2">
                                            {item.items.map((subItem) => (
                                                <SidebarMenuItem key={subItem.href}>
                                                    <SidebarMenuButton asChild isActive={pathname === subItem.href}>
                                                        <Link href={subItem.href}><subItem.icon /><span>{subItem.title}</span></Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/">
                                <Home />
                                <span>Back to landing</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
