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