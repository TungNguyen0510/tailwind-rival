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
    const highScore = Math.max(...submissions.map((s: Submission) => s.accuracy));

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

    const uniqueUsers = new Set(submissions.map((s: Submission) => s.user_id));
    const totalPlayers = uniqueUsers.size;
    const totalAccuracy = submissions.reduce((sum: number, s: Submission) => sum + s.accuracy, 0);
    const averageSuccessRate = totalAccuracy / submissions.length;
    const totalCodeLength = submissions.reduce((sum: number, s: Submission) => sum + s.code.length, 0);
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
