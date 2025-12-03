"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LockKeyhole } from "lucide-react";
import FlipCountdown from "./FlipCountdown";

/**
 * TomorrowCard Component
 * Displays a locked preview of tomorrow's challenge with a countdown timer
 * Shows a blurred/locked image and countdown until the challenge unlocks at midnight
 */
export default function TomorrowCard() {
  return (
    <Card className="overflow-hidden rounded-[6px] bg-card/80 hover:scale-105 transition-all duration-300">
      <CardContent className="p-2 relative">
        {/* Locked/blurred preview image */}
        <div className="relative aspect-4/3 rounded-[6px] overflow-hidden bg-linear-to-br from-muted to-muted-foreground/20">
          {/* Color bars pattern to simulate locked content */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-red-500/60" />
            <div className="flex-1 bg-yellow-500/60" />
            <div className="flex-1 bg-green-500/60" />
            <div className="flex-1 bg-cyan-500/60" />
            <div className="flex-1 bg-blue-500/60" />
            <div className="flex-1 bg-purple-500/60" />
          </div>

          {/* Silhouette overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

          {/* Lock icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 rounded-full bg-black/50 backdrop-blur-sm">
              <LockKeyhole className="w-8 h-8 text-white/80" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-3 py-3 flex flex-col items-center gap-2">
        <span className="text-sm text-card-foreground/50">Unlocks in</span>
        <FlipCountdown />
      </CardFooter>
    </Card>
  );
}
