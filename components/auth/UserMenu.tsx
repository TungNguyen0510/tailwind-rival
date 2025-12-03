"use client";

import { signOutAction } from "@/app/actions";
import { User } from "@supabase/supabase-js";

import { LogOut, Plus, Settings, User as UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useEffect, useState } from "react";
import { getUserDisplayInfoFromUser } from "@/app/actions";
import { UserDisplayInfo } from "@/types/user-settings";

type UserMenuProps = {
  user: User;
};

const UserMenu = (props: UserMenuProps) => {
  const { user } = props;
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<UserDisplayInfo>({
    userId: user.id,
    avatarUrl: user.user_metadata?.avatar_url || null,
    displayName: user.user_metadata?.full_name || "User",
  });

  // Fetch user display info
  const fetchUserInfo = async () => {
    const info = await getUserDisplayInfoFromUser(user);
    setUserInfo(info);
  };

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchUserInfo();

    // Listen for settings update event
    const handleSettingsUpdate = () => {
      fetchUserInfo();
    };

    window.addEventListener("userSettingsUpdated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("userSettingsUpdated", handleSettingsUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]); // Only depend on user.id to avoid infinite loops

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 border">
          <AvatarImage
            src={userInfo.avatarUrl || undefined}
            alt="avatar"
            width={36}
            height={36}
            className="rounded-full size-9 overflow-hidden select-none cursor-pointer"
          />
          <AvatarFallback className="text-xs">
            {userInfo.displayName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{userInfo.displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/playground")}
          >
            <Plus size={20} />
            <span>Create a Challenge</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push(`/profile/${user.id}`)}
          >
            <UserIcon size={20} />
            <span>View Your Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/settings")}
          >
            <Settings size={20} />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={signOutAction}
        >
          <LogOut size={20} />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
