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
import Image from "next/image";
import { useRouter } from "next/navigation";

type UserMenuProps = {
  user: User;
};

const UserMenu = (props: UserMenuProps) => {
  const { user } = props;

  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          src={user.user_metadata.avatar_url}
          alt="avatar"
          width={36}
          height={36}
          className="rounded-full size-9 overflow-hidden cursor-pointe select-none"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{user.user_metadata.full_name}</DropdownMenuLabel>
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
            <span>View Profile</span>
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
