import { TimeLeft } from "@/types/time";

/**
 * Gets today's date in local timezone as YYYY-MM-DD format
 * @returns Date string in YYYY-MM-DD format
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Debounce function - delays execution until after a specified timeout
 * @param fn - Function to debounce
 * @param timeout - Delay in milliseconds (default: 300ms)
 * @returns Debounced function
 */
export const debounce = (fn: Function, timeout = 300) => {
  let timerFlag: NodeJS.Timeout;

  return (...args: unknown[]) => {
    clearTimeout(timerFlag);

    timerFlag = setTimeout(() => fn(...args), timeout);
  };
};

/**
 * Formats a date string from "YYYY-MM-DD" to "MMM D" format
 * Example: "2025-12-02" -> "Dec 2"
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string in "MMM D" format
 */
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();

  return `${month} ${day}`;
};


/**
 * Gets the color of the accuracy based on the accuracy percentage
 * @param accuracy - Accuracy percentage
 * @returns Color class name
 */
export const getAccuracyColor = (accuracy: number, type: "text" | "bg" = "text") => {
  if (accuracy >= 95) return type === "text" ? "text-green-500" : "bg-green-500";
  if (accuracy >= 80) return type === "text" ? "text-blue-500" : "bg-blue-500";
  if (accuracy >= 60) return type === "text" ? "text-yellow-500" : "bg-yellow-500";
  return type === "text" ? "text-orange-500" : "bg-orange-500";
};



/**
 * Calculate time remaining until midnight
 * @returns Time left until midnight
 */
export const getTimeUntilMidnight = (): TimeLeft => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const diff = midnight.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

/**
 * Calculates the total score based on accuracy and code efficiency.
 *
 * Score Formula:
 * - accuracyPoints = accuracy * 10 (0-1000 points)
 * - codeEfficiencyBonus = max(0, 200 - codeLength / 5) (0-200 points)
 * - totalScore = accuracyPoints + codeEfficiencyBonus (0-1200 points)
 *
 * This ensures accuracy is the primary factor (~83% of max score),
 * while shorter code is rewarded with bonus points.
 *
 * @param accuracy - The accuracy percentage (0-100)
 * @param codeLength - The number of characters in the code
 * @returns The calculated score (0-1200)
 */
export const calculateScore = (accuracy: number, codeLength: number): number => {
  // Accuracy contributes 0-1000 points
  const accuracyPoints = accuracy * 10;

  // Code efficiency bonus: shorter code = more bonus points
  // Every 5 characters costs 1 bonus point, max 200 bonus points
  const codeEfficiencyBonus = Math.max(0, 200 - Math.floor(codeLength / 5));

  // Total score rounded to 2 decimal places
  const totalScore = Math.round((accuracyPoints + codeEfficiencyBonus) * 100) / 100;

  return totalScore;
};
