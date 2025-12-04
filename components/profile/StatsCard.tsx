import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

/**
 * Stats Card Component
 * Displays a single statistic with a label in a card format.
 * Supports an optional icon displayed at the top center of the card.
 * Used for showing Global Rank, Completed Challenges, and Day Streak.
 */

interface StatsCardProps {
  value: string | number | null;
  label: string;
  icon?: ReactNode; // Optional icon to display at top center
}

export const StatsCard = ({ value, label, icon }: StatsCardProps) => {
  return (
    <Card className="relative">
      {icon && (
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-card rounded-full p-2 shadow-lg border-2 border-border">
            {icon}
          </div>
        </div>
      )}

      <CardContent
        className={`flex px-2 flex-col items-center justify-center ${icon ? "pt-8 pb-6" : "py-6"}`}
      >
        <div className="text-2xl font-bold text-yellow-600">
          {value !== null ? value : "-"}
        </div>
        <div className="text-sm text-muted-foreground/70 mt-2">{label}</div>
      </CardContent>
    </Card>
  );
};
