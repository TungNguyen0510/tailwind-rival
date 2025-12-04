"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp } from "lucide-react";
import { RecordActivity } from "@/types/submission";
import Link from "next/link";

interface RecordTickerProps {
  records: RecordActivity[];
}

/**
 * RecordTicker Component
 * Displays a continuous scrolling ticker of recent record-breaking submissions
 * Shows two types of records:
 * - "Set a new record": First submission for a challenge
 * - "Broke own record": Improved personal best score
 */
export default function RecordTicker({ records }: RecordTickerProps) {
  if (!records || records.length === 0) {
    return null;
  }

  return (
    <div
      className="w-full overflow-hidden py-3"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, #fff 25px, #fff calc(100% - 25px), transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #fff 25px, #fff calc(100% - 25px), transparent)",
      }}
    >
      <div className="flex w-max animate-scroll-x">
        {/* First copy */}
        <div className="flex gap-6 pr-6">
          {records.map((record, index) => (
            <RecordItem
              key={`first-${record.userId}-${record.challengeId}-${index}`}
              record={record}
            />
          ))}
        </div>
        {/* Second copy for seamless loop */}
        <div className="flex gap-6 pr-6">
          {records.map((record, index) => (
            <RecordItem
              key={`second-${record.userId}-${record.challengeId}-${index}`}
              record={record}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * RecordItem Component
 * Individual record card showing user, achievement type, and score
 */
function RecordItem({ record }: { record: RecordActivity }) {
  const initials = record.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isNewRecord = record.type === "new_record";
  const icon = isNewRecord ? Trophy : TrendingUp;
  const Icon = icon;
  const text = isNewRecord ? "set a new record on" : "broke own record on";

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-background/80 rounded-lg border border-border backdrop-blur-sm whitespace-nowrap min-w-fit">
      {/* User Avatar - links to profile */}
      <Link
        href={`/profile/${record.userId}`}
        className="hover:opacity-80 transition-opacity"
      >
        <Avatar className="size-8 border-2 border-yellow-500/50">
          <AvatarImage src={record.userAvatar} alt={record.userName} />
          <AvatarFallback className="text-xs bg-yellow-500/20">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Record Info */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/profile/${record.userId}`}
          className="font-semibold text-foreground hover:text-primary transition-colors"
        >
          {record.userName}
        </Link>

        <span className="text-muted-foreground">{text}</span>

        <Link
          href={`/play/${record.challengeId}`}
          className="font-medium text-foreground hover:text-primary transition-colors"
        >
          {record.challengeTitle}
        </Link>

        <span className="text-muted-foreground">with</span>

        <span className="font-bold text-yellow-500">{record.score} pts</span>

        <span className="text-xs text-muted-foreground/70">
          ({record.accuracy.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
