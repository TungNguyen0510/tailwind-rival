"use client";

import { useEffect, useRef } from "react";
import ChallengeCard from "@/components/ui/ChallengeCard";
import TomorrowCard from "@/components/ui/TomorrowCard";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import { Challenge } from "@/types/challenge";
import { formatDateShort } from "@/utils/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CircleCheck } from "lucide-react";

interface ChallengeCarouselProps {
  challenges: Challenge[];
  today: string;
  /** Map of challengeId to user's best accuracy score */
  userScores?: Record<string, number>;
}

/**
 * ChallengeCarousel Component
 * Displays a horizontally scrollable list of challenge cards
 * Automatically scrolls to center the "Today" card on mount
 */
export default function ChallengeCarousel({
  challenges,
  today,
  userScores = {},
}: ChallengeCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const todayCardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center the today's card on mount
  useEffect(() => {
    const scrollToToday = () => {
      if (todayCardRef.current) {
        todayCardRef.current.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    };

    // Small delay to ensure layout is ready
    const timer = setTimeout(scrollToToday, 100);
    return () => clearTimeout(timer);
  }, [challenges]);

  return (
    <ScrollArea className="w-full whitespace-nowrap h-96">
      <div className="flex w-max space-x-4 p-4 overflow-visible pt-12 pb-6">
        {/* Left spacer - allows today card (280px) to be centered */}
        <div className="min-w-[calc(20vw-140px)] shrink-0" />

        {challenges.map((challenge: Challenge) => {
          const isToday = challenge.target_day === today;
          const isCompleted = userScores[challenge.id] !== undefined;
          return (
            <div
              key={challenge.id}
              ref={isToday ? todayCardRef : undefined}
              className={cn(
                "relative min-w-[200px] max-w-[200px] rounded-[6px] shrink-0",
                isToday && "min-w-[280px] max-w-[280px] border-2 border-primary"
              )}
            >
              <Chip
                className={cn(
                  "absolute -top-10 left-1/2 -translate-x-1/2 text-white uppercase",
                  isCompleted
                    ? "bg-green-400"
                    : "dark:text-black bg-card-foreground"
                )}
              >
                {isCompleted && <CircleCheck className="size-3" />}
                {isToday
                  ? `${formatDateShort(challenge.target_day)} (Today)`
                  : formatDateShort(challenge.target_day)}
              </Chip>
              <ChallengeCard
                challenge={challenge}
                showChip={false}
                bestScore={userScores[challenge.id]}
              />
            </div>
          );
        })}
        {/* Tomorrow's locked challenge card */}
        <div className="relative min-w-[200px] max-w-[200px] rounded-[6px] shrink-0">
          <Chip className="absolute -top-10 left-1/2 -translate-x-1/2 text-white dark:text-black bg-card-foreground uppercase">
            Tomorrow
          </Chip>
          <TomorrowCard />
        </div>
        {/* Right spacer - allows last card to be centered */}
        <div className="min-w-[calc(20vw-140px)] shrink-0" />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
