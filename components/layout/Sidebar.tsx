"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  FlaskConical,
  Home,
  Menu,
  MenuIcon,
  Settings,
  Trophy,
  UserRound,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createClient } from "@/utils/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "../ui/button";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const playLinks: NavItem[] = [
  { label: "Daily Challenge", href: "/daily", icon: CalendarClock },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Playground", href: "/playground", icon: FlaskConical },
];

function SidebarNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const supabase = createClient();
  const pathname = usePathname();
  const [profileHref, setProfileHref] = React.useState("/profile");

  React.useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const userId = data.user?.id;
        if (userId) {
          setProfileHref(`/profile/${userId}`);
        }
      })
      .catch(() => {});
  }, []);

  const personalLinks: NavItem[] = [
    { label: "Profile", href: profileHref, icon: UserRound },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <SidebarContent className="mt-12 w-48! p-4">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={onNavigate}
                >
                  <Home className="size-4" />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Play</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {playLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2"
                      onClick={onNavigate}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>For you</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {personalLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2"
                      onClick={onNavigate}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

export default function AppSidebar() {
  return (
    <SidebarProvider className="w-48! min-h-[calc(100vh-48px-40px)]! relative">
      <SidebarTrigger className="absolute -top-10 left-2 z-21" />
      <Sidebar className="border-r border-sidebar-border bg-sidebar">
        <SidebarNavContent />
      </Sidebar>
    </SidebarProvider>
  );
}

export function AppSidebarSheet() {
  const { open, openMobile, setOpen, setOpenMobile, isMobile } = useSidebar();
  const sheetOpen = isMobile ? openMobile : open;
  const handleOpenChange = isMobile ? setOpenMobile : setOpen;

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="left"
        className="w-48! bg-sidebar p-0 text-foreground"
      >
        <SheetHeader className="px-4 py-3 text-left">
          <SheetTitle className="text-sm font-semibold text-sidebar-foreground">
            Navigation
          </SheetTitle>
        </SheetHeader>
        <div className="h-full overflow-y-auto">
          <SidebarNavContent onNavigate={() => handleOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
