"use server";

import { createClient } from "@/utils/supabase/server";
import {
  LeaderboardEntry,
  SubmissionStats,
} from "@/types/stats";
import { calculateScore } from "@/utils/utils";

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
 * Calculates the streak leaderboard based on consecutive days with submissions.
 * 
 * @param limit - Maximum number of entries to return (default: 100)
 * @returns Object with success status and leaderboard entries
 */
export const getStreakLeaderboard = async (limit: number = 100) => {
  try {
    const supabase = await createClient();

    // Fetch all submissions with created_at
    const { data: allSubmissions, error } = await supabase
      .from("submissions")
      .select("user_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions for streak leaderboard:", error);
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

    // Group submissions by user and track last submission date
    const userSubmissions = new Map<string, string[]>();
    const userLastSubmission = new Map<string, Date>();

    allSubmissions.forEach((s) => {
      const dateStr = new Date(s.created_at).toISOString().split("T")[0];
      const dates = userSubmissions.get(s.user_id) || [];
      if (!dates.includes(dateStr)) {
        dates.push(dateStr);
      }
      userSubmissions.set(s.user_id, dates);

      // Track last submission date for tiebreaker
      const submissionDate = new Date(s.created_at);
      const current = userLastSubmission.get(s.user_id);
      if (!current || submissionDate > current) {
        userLastSubmission.set(s.user_id, submissionDate);
      }
    });

    // Calculate streak for each user
    const userStreaks: { odUserId: string; streak: number; lastSubmission: Date }[] = [];

    // Get today's date string in YYYY-MM-DD format (UTC)
    const todayStr = new Date().toISOString().split("T")[0];

    userSubmissions.forEach((dates, odUserId) => {
      // Sort dates descending (newest first)
      const sortedDates = dates.sort((a, b) => b.localeCompare(a));

      let streak = 0;
      let expectedDate = todayStr;

      for (const dateStr of sortedDates) {
        if (dateStr === expectedDate) {
          // Date matches expected, increment streak
          streak++;
          // Calculate previous day
          const prevDate = new Date(expectedDate + "T00:00:00Z");
          prevDate.setUTCDate(prevDate.getUTCDate() - 1);
          expectedDate = prevDate.toISOString().split("T")[0];
        } else if (dateStr < expectedDate) {
          // Date is older than expected, streak broken
          break;
        }
        // If dateStr > expectedDate, skip (future date or duplicate)
      }

      userStreaks.push({
        odUserId,
        streak,
        lastSubmission: userLastSubmission.get(odUserId) || new Date(),
      });
    });

    // Sort by streak descending, then by last submission date ascending for tiebreaker
    // Earlier last submission = achieved streak first = higher rank
    const leaderboard = userStreaks
      .sort((a, b) => {
        // Primary: higher streak first
        if (b.streak !== a.streak) {
          return b.streak - a.streak;
        }
        // Tiebreaker: earlier last submission wins (achieved streak first)
        return a.lastSubmission.getTime() - b.lastSubmission.getTime();
      })
      .slice(0, limit)
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.odUserId,
        streak: entry.streak,
      }));

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

    // Calculate day streak (consecutive days with submissions from today backwards)
    let dayStreak = 0;
    if (userSubmissions && userSubmissions.length > 0) {
      // Get unique dates in YYYY-MM-DD format (UTC)
      const submissionDates = Array.from(new Set(
        userSubmissions.map((s) =>
          new Date(s.created_at).toISOString().split('T')[0]
        )
      )).sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

      // Get today's date string in YYYY-MM-DD format (UTC)
      const todayStr = new Date().toISOString().split("T")[0];
      let expectedDate = todayStr;

      for (const dateStr of submissionDates) {
        if (dateStr === expectedDate) {
          // Date matches expected, increment streak
          dayStreak++;
          // Calculate previous day
          const prevDate = new Date(expectedDate + "T00:00:00Z");
          prevDate.setUTCDate(prevDate.getUTCDate() - 1);
          expectedDate = prevDate.toISOString().split("T")[0];
        } else if (dateStr < expectedDate) {
          // Date is older than expected, streak broken
          break;
        }
        // If dateStr > expectedDate, skip (future date or duplicate)
      }
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
        dayStreak,
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
