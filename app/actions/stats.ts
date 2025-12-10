"use server";

import { createClient } from "@/utils/supabase/server";
import {
  LeaderboardEntry,
  SubmissionStats,
} from "@/types/stats";
import { calculateScore } from "@/utils/utils";

/**
 * Updates user streak when a new submission is made.
 * Implements the streak calculation logic:
 * - If first submission: current_streak = 1, longest_streak = 1
 * - If diff = 0 (submitted today): no change
 * - If diff = 1 (submitted yesterday): increment current_streak, update longest_streak
 * - If diff > 1: reset current_streak = 1
 * 
 * @param userId - The user ID
 * @param submissionDate - The date of the submission (Date object or ISO string)
 * @returns Object with success status
 */
export const updateUserStreak = async (
  userId: string,
  submissionDate: Date | string
) => {
  try {
    const supabase = await createClient();

    // Convert submissionDate to Date object if it's a string
    const subDate = typeof submissionDate === "string" 
      ? new Date(submissionDate) 
      : submissionDate;

    // Get submission date in UTC (date only, no time)
    // This ensures consistency regardless of server timezone
    const subDateUTC = new Date(Date.UTC(
      subDate.getUTCFullYear(),
      subDate.getUTCMonth(),
      subDate.getUTCDate()
    ));
    const submissionDateStr = subDateUTC.toISOString().split("T")[0];

    // Get today's date in UTC (date only, no time)
    // Use UTC to ensure consistency across all timezones
    const now = new Date();
    const todayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));
    const todayStr = todayUTC.toISOString().split("T")[0];

    // Fetch current streak record
    const { data: currentStreak, error: fetchError } = await supabase
      .from("streaks")
      .select("current_streak, longest_streak, last_submission_date")
      .eq("user_id", userId)
      .single();

    // If no streak record exists, create new one
    if (fetchError && fetchError.code === "PGRST116") {
      // No record found, create new streak
      const { error: insertError } = await supabase
        .from("streaks")
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_submission_date: todayStr, // Use today's date (UTC)
        });

      if (insertError) {
        console.error("Error creating streak record:", insertError);
        return { success: false };
      }

      return { success: true };
    }

    if (fetchError) {
      console.error("Error fetching streak:", fetchError);
      return { success: false };
    }

    // Get last submission date from database
    const lastSubmissionDateStr = currentStreak?.last_submission_date;
    
    // If no last_submission_date, treat as first submission
    if (!lastSubmissionDateStr) {
      const { error: updateError } = await supabase
        .from("streaks")
        .update({
          current_streak: 1,
          longest_streak: 1,
          last_submission_date: todayStr, // Use today's date (UTC)
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating streak:", updateError);
        return { success: false };
      }

      return { success: true };
    }

    // Compare dates as strings (YYYY-MM-DD format) to avoid timezone issues
    // This ensures we only count one submission per day
    if (lastSubmissionDateStr === todayStr) {
      // User already submitted today, no change to streak
      // Do not update last_submission_date to avoid unnecessary writes
      return { success: true };
    }

    // Calculate day difference between today (UTC) and last_submission_date
    const lastDateUTC = new Date(lastSubmissionDateStr + "T00:00:00Z");
    const diffTime = todayUTC.getTime() - lastDateUTC.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newCurrentStreak: number;
    let newLongestStreak: number;

    if (diffDays === 1) {
      // Continue streak: increment current_streak (yesterday -> today)
      const current = Number(currentStreak?.current_streak || 0);
      newCurrentStreak = current + 1;
      newLongestStreak = Math.max(
        Number(currentStreak?.longest_streak || 0),
        newCurrentStreak
      );
    } else {
      // Streak broken (diffDays > 1) or first submission: reset to 1
      newCurrentStreak = 1;
      newLongestStreak = Number(currentStreak?.longest_streak || 0);
    }

    // Update streak record
    // Only update if last_submission_date is different from today
    // This ensures we only count one submission per day
    const { error: updateError } = await supabase
      .from("streaks")
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_submission_date: todayStr, // Use today (UTC), not submission date
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating streak:", updateError);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating streak:", error);
    return { success: false };
  }
};

/**
 * Calculates the global leaderboard based on best score per challenge per user.
 * Only counts each user's highest score for each challenge.
 * 
 * @param limit - Maximum number of entries to return (default: 100)
 * @returns Object with success status and leaderboard entries
 */
export const getGlobalLeaderboard = async (limit: number = 100) => {
  try {
    const supabase = await createClient();

    // Fetch all submissions with necessary fields including created_at for tiebreaker
    const { data: allSubmissions, error } = await supabase
      .from("submissions")
      .select("user_id, challenge_id, accuracy, code, created_at");

    if (error) {
      console.error("Error fetching submissions for leaderboard:", error);
      return {
        success: false,
        leaderboard: [],
      };
    }

    if (!allSubmissions || allSubmissions.length === 0) {
      return {
        success: true,
        leaderboard: [],
      };
    }

    // Calculate best score per challenge per user
    // Key: `${userId}::${challengeId}`, Value: best score (using :: as separator to avoid UUID conflicts)
    const bestScoresPerChallenge = new Map<string, number>();

    allSubmissions.forEach((s) => {
      const key = `${s.user_id}::${s.challenge_id}`;
      const score = calculateScore(s.accuracy, s.code.length);
      const currentBest = bestScoresPerChallenge.get(key) || 0;

      if (score > currentBest) {
        bestScoresPerChallenge.set(key, score);
      }
    });

    // Track last submission date per user (for tiebreaker - earlier last submission = achieved score first)
    const userLastSubmission = new Map<string, Date>();
    allSubmissions.forEach((s) => {
      const submissionDate = new Date(s.created_at);
      const current = userLastSubmission.get(s.user_id);
      if (!current || submissionDate > current) {
        userLastSubmission.set(s.user_id, submissionDate);
      }
    });

    // Aggregate total score and challenge count per user
    const userStats = new Map<string, { totalScore: number; challengeCount: number }>();

    bestScoresPerChallenge.forEach((score, key) => {
      const odUserId = key.split("::")[0];
      const current = userStats.get(odUserId) || { totalScore: 0, challengeCount: 0 };

      userStats.set(odUserId, {
        totalScore: current.totalScore + score,
        challengeCount: current.challengeCount + 1,
      });
    });

    // Sort by total score (descending), then by last submission date (ascending) for tiebreaker
    // Earlier last submission = achieved score first = higher rank
    const leaderboard: LeaderboardEntry[] = Array.from(userStats.entries())
      .sort((a, b) => {
        // Primary: higher score first
        if (b[1].totalScore !== a[1].totalScore) {
          return b[1].totalScore - a[1].totalScore;
        }
        // Tiebreaker: earlier last submission wins (achieved score first)
        const dateA = userLastSubmission.get(a[0])?.getTime() || 0;
        const dateB = userLastSubmission.get(b[0])?.getTime() || 0;
        return dateA - dateB;
      })
      .slice(0, limit)
      .map(([userId, stats], index) => ({
        rank: index + 1,
        userId,
        totalScore: Math.round(stats.totalScore),
        challengeCount: stats.challengeCount,
      }));

    return {
      success: true,
      leaderboard,
    };
  } catch (error) {
    console.error("Unexpected error fetching leaderboard:", error);
    return {
      success: false,
      leaderboard: [],
    };
  }
};

/**
 * Gets a specific user's rank and total score from the leaderboard.
 * 
 * @param userId - The user ID to find rank for
 * @returns Object with rank, totalScore, and challengeCount (or null if not found)
 */
export const getUserRankAndScore = async (userId: string) => {
  try {
    const supabase = await createClient();

    // Fetch all submissions including created_at for tiebreaker
    const { data: allSubmissions, error } = await supabase
      .from("submissions")
      .select("user_id, challenge_id, accuracy, code, created_at");

    if (error) {
      console.error("Error fetching submissions for user rank:", error);
      return { rank: null, totalScore: 0, challengeCount: 0 };
    }

    if (!allSubmissions || allSubmissions.length === 0) {
      return { rank: null, totalScore: 0, challengeCount: 0 };
    }

    // Calculate best score per challenge per user
    // Using :: as separator to avoid UUID conflicts (UUIDs contain hyphens)
    const bestScoresPerChallenge = new Map<string, number>();

    allSubmissions.forEach((s) => {
      const key = `${s.user_id}::${s.challenge_id}`;
      const score = calculateScore(s.accuracy, s.code.length);
      const currentBest = bestScoresPerChallenge.get(key) || 0;

      if (score > currentBest) {
        bestScoresPerChallenge.set(key, score);
      }
    });

    // Track last submission date per user (for tiebreaker)
    const userLastSubmission = new Map<string, Date>();
    allSubmissions.forEach((s) => {
      const submissionDate = new Date(s.created_at);
      const current = userLastSubmission.get(s.user_id);
      if (!current || submissionDate > current) {
        userLastSubmission.set(s.user_id, submissionDate);
      }
    });

    // Aggregate total score per user
    const userStats = new Map<string, { totalScore: number; challengeCount: number }>();

    bestScoresPerChallenge.forEach((score, key) => {
      const keyUserId = key.split("::")[0];
      const current = userStats.get(keyUserId) || { totalScore: 0, challengeCount: 0 };

      userStats.set(keyUserId, {
        totalScore: current.totalScore + score,
        challengeCount: current.challengeCount + 1,
      });
    });

    // Sort by total score (desc), then by last submission date (asc) for tiebreaker
    // Earlier last submission = achieved score first = higher rank
    const sortedUsers = Array.from(userStats.entries())
      .sort((a, b) => {
        if (b[1].totalScore !== a[1].totalScore) {
          return b[1].totalScore - a[1].totalScore;
        }
        const dateA = userLastSubmission.get(a[0])?.getTime() || 0;
        const dateB = userLastSubmission.get(b[0])?.getTime() || 0;
        return dateA - dateB;
      });

    const userIndex = sortedUsers.findIndex(([uid]) => uid === userId);

    if (userIndex === -1) {
      return { rank: null, totalScore: 0, challengeCount: 0 };
    }

    const userStatsData = sortedUsers[userIndex][1];

    return {
      rank: userIndex + 1,
      totalScore: Math.round(userStatsData.totalScore),
      challengeCount: userStatsData.challengeCount,
    };
  } catch (error) {
    console.error("Unexpected error getting user rank:", error);
    return { rank: null, totalScore: 0, challengeCount: 0 };
  }
};

/**
 * Fetches the streak leaderboard based on longest_streak from streaks table.
 * Ranks users by their longest streak (not current streak).
 * 
 * @param limit - Maximum number of entries to return (default: 100)
 * @returns Object with success status and leaderboard entries
 */
export const getStreakLeaderboard = async (limit: number = 100) => {
  try {
    const supabase = await createClient();

    // Fetch all streaks, ordered by longest_streak descending
    const { data: streaks, error } = await supabase
      .from("streaks")
      .select("user_id, longest_streak, current_streak, last_submission_date")
      .order("longest_streak", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching streak leaderboard:", error);
      return {
        success: false,
        leaderboard: [],
      };
    }

    if (!streaks || streaks.length === 0) {
      return {
        success: true,
        leaderboard: [],
      };
    }

    // Build leaderboard with ranking
    // Users with same longest_streak get same rank, next rank skips
    const leaderboard: Array<{
      rank: number;
      userId: string;
      streak: number; // longest_streak for ranking
      currentStreak?: number; // current_streak for display
    }> = [];

    let currentRank = 1;
    let previousLongestStreak: number | null = null;

    for (let i = 0; i < streaks.length; i++) {
      const streak = streaks[i];
      const longestStreak = Number(streak.longest_streak || 0);
      const currentStreak = Number(streak.current_streak || 0);

      // If this streak is different from previous, update rank
      if (previousLongestStreak !== null && longestStreak !== previousLongestStreak) {
        currentRank = i + 1;
      }

      leaderboard.push({
        rank: currentRank,
        userId: streak.user_id,
        streak: longestStreak, // Use longest_streak for ranking
        currentStreak: currentStreak, // Include current_streak for display
      });

      previousLongestStreak = longestStreak;
    }

    return {
      success: true,
      leaderboard,
    };
  } catch (error) {
    console.error("Unexpected error fetching streak leaderboard:", error);
    return {
      success: false,
      leaderboard: [],
    };
  }
};

/**
 * Fetches user's personal stats for a specific challenge.
 * Returns last submission stats and best submission stats (highest score).
 * 
 * @param challengeId - The ID of the challenge
 * @returns Object with success status and user stats
 */
export const getUserStats = async (challengeId: string) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        stats: null,
      };
    }

    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("accuracy, score, code, created_at")
      .eq("challenge_id", challengeId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (submissionsError) {
      console.error("Error fetching user stats:", submissionsError);
      return {
        success: false,
        stats: null,
      };
    }

    if (!submissions || submissions.length === 0) {
      return {
        success: true,
        stats: {
          last: null,
          best: null,
        },
      };
    }

    // Last submission stats
    const lastSubmission = submissions[0];
    const lastStats: SubmissionStats = {
      accuracy: lastSubmission.accuracy,
      score: lastSubmission.score || calculateScore(lastSubmission.accuracy, lastSubmission.code.length),
      codeLength: lastSubmission.code.length,
    };

    // Best submission (highest score)
    const bestSubmission = submissions.reduce((best, current) => {
      const currentScore = current.score || calculateScore(current.accuracy, current.code.length);
      const bestScore = best.score || calculateScore(best.accuracy, best.code.length);
      return currentScore > bestScore ? current : best;
    }, submissions[0]);

    const bestStats: SubmissionStats = {
      accuracy: bestSubmission.accuracy,
      score: bestSubmission.score || calculateScore(bestSubmission.accuracy, bestSubmission.code.length),
      codeLength: bestSubmission.code.length,
    };

    return {
      success: true,
      stats: {
        last: lastStats,
        best: bestStats,
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching user stats:", error);
    return {
      success: false,
      stats: null,
    };
  }
};

/**
 * Fetches global statistics for a specific challenge.
 * Returns total players, average success rate, average code length, and average score.
 * 
 * @param challengeId - The ID of the challenge
 * @returns Object with success status and global stats
 */
export const getGlobalStats = async (challengeId: string) => {
  try {
    const supabase = await createClient();

    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("user_id, accuracy, score, code")
      .eq("challenge_id", challengeId);

    if (submissionsError) {
      console.error("Error fetching global stats:", submissionsError);
      return {
        success: false,
        stats: null,
      };
    }

    if (!submissions || submissions.length === 0) {
      return {
        success: true,
        stats: {
          totalPlayers: 0,
          averageSuccessRate: 0,
          averageCodeLength: 0,
          averageScore: 0,
        },
      };
    }

    const uniqueUsers = new Set(submissions.map((s) => s.user_id));
    const totalPlayers = uniqueUsers.size;
    const totalAccuracy = submissions.reduce((sum: number, s) => sum + s.accuracy, 0);
    const averageSuccessRate = totalAccuracy / submissions.length;
    const totalCodeLength = submissions.reduce((sum: number, s) => sum + s.code.length, 0);
    const averageCodeLength = Math.round(totalCodeLength / submissions.length);

    // Calculate average score
    const totalScore = submissions.reduce((sum: number, s) => {
      const score = s.score || calculateScore(s.accuracy, s.code.length);
      return sum + score;
    }, 0);
    const averageScore = Math.round(totalScore / submissions.length);

    return {
      success: true,
      stats: {
        totalPlayers,
        averageSuccessRate: Math.round(averageSuccessRate * 100) / 100,
        averageCodeLength,
        averageScore,
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching global stats:", error);
    return {
      success: false,
      stats: null,
    };
  }
};

/**
 * Fetches comprehensive profile statistics for a specific user.
 * Returns global rank, completed challenges count, day streak, average accuracy, and average code length.
 * 
 * @param userId - The ID of the user to fetch stats for
 * @returns Object with success status and profile stats
 */
export const getUserProfileStats = async (userId: string) => {
  try {
    const supabase = await createClient();

    // Get all submissions for this user
    const { data: userSubmissions, error: userError } = await supabase
      .from("submissions")
      .select("challenge_id, accuracy, created_at, code")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (userError) {
      console.error("Error fetching user submissions:", userError);
      return {
        success: false,
        stats: null,
      };
    }

    // Calculate completed challenges (at least one 100% accuracy submission)
    const completedChallenges = new Set(
      (userSubmissions || [])
        .filter((s) => s.accuracy === 100)
        .map((s) => s.challenge_id)
    ).size;

    // Get streak from streaks table
    const { data: streakData, error: streakError } = await supabase
      .from("streaks")
      .select("current_streak, longest_streak")
      .eq("user_id", userId)
      .single();

    // Default to 0 if no streak record exists
    const currentStreak = streakData?.current_streak ? Number(streakData.current_streak) : 0;
    const longestStreak = streakData?.longest_streak ? Number(streakData.longest_streak) : 0;

    if (streakError && streakError.code !== "PGRST116") {
      // Log error only if it's not a "not found" error
      console.error("Error fetching streak:", streakError);
    }

    // Get global rank and total score using the shared function
    // This calculates rank based on best score per challenge per user
    const { rank: globalRank, totalScore } = await getUserRankAndScore(userId);

    // Calculate average accuracy (match) and average code length (characters)
    let avgAccuracy = 0;
    let avgCodeLength = 0;

    if (userSubmissions && userSubmissions.length > 0) {
      const totalAccuracy = userSubmissions.reduce((sum, s) => sum + s.accuracy, 0);
      avgAccuracy = Math.round((totalAccuracy / userSubmissions.length) * 100) / 100;

      const totalCodeLength = userSubmissions.reduce((sum, s) => sum + s.code.length, 0);
      avgCodeLength = Math.round(totalCodeLength / userSubmissions.length);
    }

    return {
      success: true,
      stats: {
        globalRank,
        completedChallenges,
        currentStreak,
        longestStreak,
        avgAccuracy,
        avgCodeLength,
        totalScore,
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching user profile stats:", error);
    return {
      success: false,
      stats: null,
    };
  }
};

/**
 * Fetches user submission history for the past N months to generate a heatmap.
 * Returns an object with dates as keys and submission counts as values.
 * Fetches full months: current month + (N-1) previous months.
 * 
 * @param userId - The ID of the user
 * @param months - Number of months to display (default: 6)
 * @returns Object with success status and submission history
 */
export const getUserSubmissionHistory = async (userId: string, months: number = 6) => {
  try {
    const supabase = await createClient();

    const today = new Date();
    // Start from the 1st day of (N-1) months ago
    const startDate = new Date(today.getFullYear(), today.getMonth() - (months - 1), 1);
    startDate.setHours(0, 0, 0, 0);

    const { data: submissions, error } = await supabase
      .from("submissions")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString());

    if (error) {
      console.error("Error fetching submission history:", error);
      return {
        success: false,
        history: {},
      };
    }

    // Group submissions by date (using local date to avoid timezone issues)
    const history: Record<string, number> = {};

    (submissions || []).forEach((s) => {
      const dateObj = new Date(s.created_at);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      history[date] = (history[date] || 0) + 1;
    });

    return {
      success: true,
      history,
    };
  } catch (error) {
    console.error("Unexpected error fetching submission history:", error);
    return {
      success: false,
      history: {},
    };
  }
};

/**
 * Fetches list of challenges that the user has completed (100% accuracy).
 * Returns challenge details including images for display.
 * 
 * @param userId - The ID of the user
 * @returns Object with success status and array of completed challenges
 */
export const getUserCompletedChallenges = async (userId: string) => {
  try {
    const supabase = await createClient();

    // Get all perfect submissions for this user
    const { data: perfectSubmissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("challenge_id")
      .eq("user_id", userId)
      .eq("accuracy", 100)
      .order("created_at", { ascending: false });

    if (submissionsError) {
      console.error("Error fetching perfect submissions:", submissionsError);
      return {
        success: false,
        challenges: [],
      };
    }

    if (!perfectSubmissions || perfectSubmissions.length === 0) {
      return {
        success: true,
        challenges: [],
      };
    }

    // Get unique challenge IDs
    const challengeIds = Array.from(new Set(
      perfectSubmissions.map((s: { challenge_id: string }) => s.challenge_id)
    ));

    // Fetch challenge details
    const { data: challenges, error: challengesError } = await supabase
      .from("challenges")
      .select("*")
      .in("id", challengeIds);

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError);
      return {
        success: false,
        challenges: [],
      };
    }

    return {
      success: true,
      challenges: challenges || [],
    };
  } catch (error) {
    console.error("Unexpected error fetching completed challenges:", error);
    return {
      success: false,
      challenges: [],
    };
  }
};
