"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LockKeyhole } from "lucide-react";
import FlipCountdown from "./FlipCountdown";
import Image from "next/image";

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
        <div className="relative aspect-4/3 rounded-[6px] overflow-hidden">
          <div
            style={{
              position: "absolute",
              top: "-32px",
              left: "-32px",
              width: "150%",
              height: "150%",
              background:
                "repeating-linear-gradient(#111, #111 50%, white 50%, white)",
              backgroundSize: "5px 5px",
              filter: "url(#noise)",
              backdropFilter: "blur(1px)",
            }}
          />

          <svg className="size-0">
            <filter id="noise">
              <feTurbulence id="turbulence">
                <animate
                  attributeName="baseFrequency"
                  dur="50s"
                  values="0.9 0.9;0.8 0.8; 0.9 0.9"
                  repeatCount="indefinite"
                ></animate>
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                scale="60"
              ></feDisplacementMap>
            </filter>
          </svg>

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
