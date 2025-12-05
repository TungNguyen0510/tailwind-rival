/**
 * Stats-related type definitions
 */

/**
 * Leaderboard entry with user info and total score
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalScore: number;
  challengeCount: number;
}

/**
 * Streak leaderboard entry
 * Uses longest_streak for ranking
 */
export interface StreakLeaderboardEntry {
  rank: number;
  userId: string;
  streak: number; // longest_streak for leaderboard
  currentStreak: number; // current_streak (optional, for display)
}

/**
 * User stats for a single submission
 */
export interface SubmissionStats {
  accuracy: number;
  score: number;
  codeLength: number;
}

/**
 * User's personal stats for a challenge
 */
export interface UserChallengeStats {
  last: SubmissionStats | null;
  best: SubmissionStats | null;
}

/**
 * Global stats for a challenge
 */
export interface GlobalChallengeStats {
  totalPlayers: number;
  averageSuccessRate: number;
  averageCodeLength: number;
  averageScore: number;
}

/**
 * User's profile stats
 */
export interface UserProfileStats {
  globalRank: number | null;
  completedChallenges: number;
  currentStreak: number;
  longestStreak: number;
  avgAccuracy: number;
  avgCodeLength: number;
  totalScore: number;
}

/**
 * User's rank and score info
 */
export interface UserRankInfo {
  rank: number | null;
  totalScore: number;
  challengeCount: number;
}
