import { Swords } from "lucide-react";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import HeaderAuth from "@/components/auth/HeaderAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
function Header() {
  return (
    <nav className="sticky top-0 left-0 w-full flex justify-center border-b border-b-foreground/10 h-12 z-10 bg-card">
      <div className="w-full flex justify-between items-center p-2 px-10 text-sm">
        <div className="flex gap-10 justify-between items-center transition-colors">
          <div className="flex gap-5 items-center font-semibold text-lg">
            <Link
              href={"/"}
              className="flex gap-2 items-center hover:text-primary"
            >
              <Image
                src="/favicon.ico"
                alt="Tailwind Rival"
                width={32}
                height={32}
              />
              <span>Tailwind Rival</span>
            </Link>
          </div>

          <div className="flex gap-5 items-center text-base">
            <Link href="/daily">
              <Button variant="ghost" className="hover:scale-105">
                Daily challenges
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="ghost" className="hover:scale-105">
                Leaderboard
              </Button>
            </Link>
            <Link href="/playground">
              <Button variant="ghost" className="hover:scale-105">
                Playground
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-2 justify-between items-center">
          <ThemeSwitcher />
          <HeaderAuth />
        </div>
      </div>
    </nav>
  );
}

export default Header;
