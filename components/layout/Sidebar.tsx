"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  FlaskConical,
  Home,
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
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";

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
  const [profileHref, setProfileHref] = React.useState("");

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
    <SidebarContent className="mt-12">
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

      {profileHref && (
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
      )}
    </SidebarContent>
  );
}

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPlaySheet = React.useMemo(
    () =>
      pathname.startsWith("/play/") ||
      pathname === "/play" ||
      pathname.startsWith("/playground"),
    [pathname]
  );

  return (
    <SidebarProvider
      className="flex flex-col min-h-[calc(100vh-48px-40px)]! relative"
      forceMobile={isPlaySheet}
      defaultOpen={!isPlaySheet}
    >
      <SidebarTrigger className="absolute -top-10.5 left-3 z-20" />
      <div className="flex flex-1">
        <Sidebar>
          <SidebarNavContent />
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
