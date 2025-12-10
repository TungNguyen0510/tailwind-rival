import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import HeaderAuth from "@/components/auth/HeaderAuth";
import Link from "next/link";
import Image from "next/image";
function Header() {
  return (
    <nav className="sticky top-0 left-0 w-full flex justify-center border-b border-b-foreground/10 h-12 z-20 bg-card select-none">
      <div className="w-full flex justify-between items-center p-2 pl-14 pr-4 md:px-14 text-sm">
        <div className="flex gap-10 justify-between items-center transition-colors">
          <div className="flex gap-5 items-center font-semibold text-base lg:text-lg">
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
              <span className="text-nowrap">Tailwind Rival</span>
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
