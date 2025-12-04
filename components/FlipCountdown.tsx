"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TimeLeft } from "@/types/time";
import { getTimeUntilMidnight } from "@/utils/utils";

/**
 * FlipDigit Component
 * Displays a single digit with flip animation styling
 */
function FlipDigit({ value, label }: { value: string; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <div
          className={cn(
            "flex items-center justify-center",
            "px-1 py-0.3 rounded-md",
            "bg-card-foreground text-white dark:text-black",
            "text-lg font-mono",
            "shadow-md"
          )}
        >
          {value}
        </div>
      </div>
      {label && (
        <span className="text-[10px] text-muted-foreground/50 uppercase">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * FlipCountdown Component
 * Displays a countdown timer to midnight with flip-style digits
 */
export default function FlipCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeUntilMidnight());

    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-1">
        <FlipDigit value="0" />
        <FlipDigit value="0" />
        <span className="text-sm font-bold text-muted-foreground">:</span>
        <FlipDigit value="0" />
        <FlipDigit value="0" />
        <span className="text-sm font-bold text-muted-foreground">:</span>
        <FlipDigit value="0" />
        <FlipDigit value="0" />
      </div>
    );
  }

  const hours = timeLeft.hours.toString().padStart(2, "0");
  const minutes = timeLeft.minutes.toString().padStart(2, "0");
  const seconds = timeLeft.seconds.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1">
      <FlipDigit value={hours[0]} />
      <FlipDigit value={hours[1]} />
      <span className="text-xl font-bold text-muted-foreground">:</span>
      <FlipDigit value={minutes[0]} />
      <FlipDigit value={minutes[1]} />
      <span className="text-xl font-bold text-muted-foreground">:</span>
      <FlipDigit value={seconds[0]} />
      <FlipDigit value={seconds[1]} />
    </div>
  );
}
