"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";
import Link from "next/link";

export default function NotFound() {
  useDisableRightClick();
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-48px-40px)] gap-4">
      <div className="relative size-[50%] select-none">
        <div className="absolute inset-0">
          <Image
            src="/not-found.gif"
            alt="Not Found"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <h1 className="text-6xl font-bold">404</h1>
      <h1 className="text-xl font-semibold">Page Not Found</h1>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
