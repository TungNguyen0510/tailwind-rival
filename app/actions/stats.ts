"use server";

import { createClient } from "@/utils/supabase/server";
import { Submission } from "@/types/submission";

/**
 * Fetches user's personal stats for a specific challenge.
 * Returns last submission score and highest score.
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
      .select("accuracy, created_at")
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
          lastScore: null,
          highScore: null,
        },
      };
    }

    const lastScore = submissions[0].accuracy;
    const highScore = Math.max(...submissions.map((s) => s.accuracy));

    return {
      success: true,
      stats: {
        lastScore,
        highScore,
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
 * Returns total players, average success rate, and average code length.
 * 
 * @param challengeId - The ID of the challenge
 * @returns Object with success status and global stats
 */
export const getGlobalStats = async (challengeId: string) => {
  try {
    const supabase = await createClient();

    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("user_id, accuracy, code")
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
        },
      };
    }

    const uniqueUsers = new Set(submissions.map((s) => s.user_id));
    const totalPlayers = uniqueUsers.size;
    const totalAccuracy = submissions.reduce((sum: number, s) => sum + s.accuracy, 0);
    const averageSuccessRate = totalAccuracy / submissions.length;
    const totalCodeLength = submissions.reduce((sum: number, s) => sum + s.code.length, 0);
    const averageCodeLength = Math.round(totalCodeLength / submissions.length);

    return {
      success: true,
      stats: {
        totalPlayers,
        averageSuccessRate: Math.round(averageSuccessRate * 100) / 100,
        averageCodeLength,
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
      const submissionDates = Array.from(new Set(
        userSubmissions.map((s) => 
          new Date(s.created_at).toISOString().split('T')[0]
        )
      )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(today);
      
      for (const dateStr of submissionDates) {
        const submissionDate = new Date(dateStr);
        submissionDate.setHours(0, 0, 0, 0);
        
        const diffTime = currentDate.getTime() - submissionDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          dayStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (diffDays > 1) {
          break;
        }
      }
    }

    // Calculate global rank based on total accuracy score
    const { data: allSubmissions, error: allError } = await supabase
      .from("submissions")
      .select("user_id, accuracy");

    if (allError) {
      console.error("Error fetching all submissions:", allError);
      return {
        success: false,
        stats: null,
      };
    }

    // Calculate total score per user
    const userScores = new Map<string, number>();
    
    (allSubmissions || []).forEach((s) => {
      const currentScore = userScores.get(s.user_id) || 0;
      userScores.set(s.user_id, currentScore + s.accuracy);
    });

    // Sort users by total score
    const sortedUsers = Array.from(userScores.entries())
      .sort((a, b) => b[1] - a[1]);

    // Find user's rank
    const userRank = sortedUsers.findIndex(([uid]) => uid === userId) + 1;
    const globalRank = userRank > 0 ? userRank : null;

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