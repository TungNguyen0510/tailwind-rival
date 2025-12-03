"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

/**
 * Submission Heatmap Component
 * Displays a GitHub-style contribution heatmap showing user submissions
 * over the past 6 months. Each cell represents a day with color intensity
 * based on submission count.
 */

interface SubmissionHeatmapProps {
  history: Record<string, number>; // Date string -> submission count
  months?: number; // Number of months to display (default: 6)
}

export const SubmissionHeatmap = ({
  history,
  months = 6,
}: SubmissionHeatmapProps) => {
  // Generate all dates for the past N months (full months including future days of current month)
  const generateDateGrid = () => {
    const today = new Date();

    // Start from the 1st day of (N-1) months ago
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth() - (months - 1),
      1
    );
    startDate.setHours(0, 0, 0, 0);

    // End at the last day of current month (always show full current month)
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Group dates by week for grid layout (full rectangle with all cells)
  const groupByWeeks = (dates: Date[]) => {
    if (dates.length === 0) return [];

    const weeks: (Date | null)[][] = [];
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    // Start from the first Sunday before or on the first date
    const startDate = new Date(firstDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End on the last Saturday after or on the last date
    const endDate = new Date(lastDate);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    let currentWeek: (Date | null)[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      // Use local date comparison to avoid timezone issues
      const currentYear = current.getFullYear();
      const currentMonth = current.getMonth();
      const currentDay = current.getDate();

      const originalDate = dates.find(
        (d) =>
          d.getFullYear() === currentYear &&
          d.getMonth() === currentMonth &&
          d.getDate() === currentDay
      );

      // Add the date if it's in range, otherwise add null for empty cells
      currentWeek.push(originalDate || null);

      if (current.getDay() === 6) {
        // Ensure each week has exactly 7 days
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    // Handle last incomplete week - fill to complete the rectangle
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  // Get submission count for a date (using local date to avoid timezone issues)
  const getSubmissionCount = (date: Date): number => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    return history[dateStr] || 0;
  };

  // Get color intensity based on submission count
  const getColorClass = (count: number): string => {
    if (count === 0) return "bg-gray-200";
    if (count === 1) return "bg-green-200";
    if (count === 2) return "bg-green-300";
    if (count === 3) return "bg-green-500";
    if (count >= 4) return "bg-green-800";
    return "bg-gray-200";
  };

  const dates = generateDateGrid();
  const weeks = groupByWeeks(dates);

  // Get month labels positioned at the correct week index
  const getMonthLabels = () => {
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    const labels: { label: string; weekIndex: number }[] = [];
    const seenMonths = new Set<number>();

    weeks.forEach((week, weekIdx) => {
      // Check all dates in the week to find any valid date
      week.forEach((date) => {
        if (date) {
          const month = date.getMonth();
          // Add label if this is the first time seeing this month
          if (!seenMonths.has(month)) {
            labels.push({
              label: monthNames[month],
              weekIndex: weekIdx,
            });
            seenMonths.add(month);
          }
        }
      });
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  // Days of week labels (all 7 days)
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Submissions in past 6 months</h2>

      <div className="flex items-center justify-center">
        <div className="flex">
          {/* Day of week labels */}
          <div className="flex flex-col gap-1 justify-start pt-7">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="h-4 flex items-center">
                <span className="text-xs text-muted-foreground/70 w-8">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap container */}
          <div className="flex-1">
            {/* Month labels */}
            <div className="relative h-5 ml-4">
              {monthLabels.map((item, idx) => (
                <span
                  key={idx}
                  className="absolute text-xs text-muted-foreground/70"
                  style={{
                    left: `${item.weekIndex * 20}px`, // 16px width + 4px gap
                  }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1 overflow-x-auto p-2">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((date, dayIdx) => {
                    if (!date) {
                      // Empty cell for dates outside the range
                      return (
                        <div
                          key={dayIdx}
                          className="w-4 h-4 rounded-xs bg-gray-100"
                        />
                      );
                    }
                    const count = getSubmissionCount(date);
                    return (
                      <TooltipProvider key={dayIdx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-4 h-4 rounded-xs ${getColorClass(count)} transition-colors hover:ring-1 hover:ring-primary cursor-pointer`}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <span>
                              {date.toDateString()}: {count} submission
                              {count !== 1 ? "s" : ""}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
