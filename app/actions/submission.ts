"use server";

import { createClient } from "@/utils/supabase/server";
import { calculateScore } from "@/utils/utils";
import sharp from "sharp";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { Submission } from "@/types/submission";

/**
 * Compares two images (target and output) pixel by pixel and calculates accuracy.
 * Calculates a total score based on accuracy and code efficiency.
 * Submits the code, accuracy, and score to the submissions table.
 *
 * Score calculation:
 * - Accuracy points: accuracy × 10 (0-1000)
 * - Code efficiency bonus: max(0, 200 - codeLength/5) (0-200)
 * - Total: 0-1200 points
 * 
 * @param challengeId - The ID of the challenge being submitted
 * @param code - The HTML/CSS code from the editor
 * @param outputImageBase64 - Base64 encoded image of the iframe output (data URL format)
 * @param targetImageUrl - Public URL of the target image to compare against
 * @returns Object with success status, accuracy, score, and code length or error message
 */
export const submitChallenge = async (
  challengeId: string,
  code: string,
  outputImageBase64: string,
  targetImageUrl: string
) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please log in to submit.",
      };
    }

    const targetResponse = await fetch(targetImageUrl);
    if (!targetResponse.ok) {
      return {
        success: false,
        error: "Failed to fetch target image for comparison.",
      };
    }
    const targetBuffer = Buffer.from(await targetResponse.arrayBuffer());

    const base64Data = outputImageBase64.replace(/^data:image\/\w+;base64,/, "");
    const outputBuffer = Buffer.from(base64Data, "base64");

    const width = 400;
    const height = 300;

    const targetProcessed = await sharp(targetBuffer)
      .resize(width, height, { fit: "fill" })
      .png()
      .toBuffer();

    const outputProcessed = await sharp(outputBuffer)
      .resize(width, height, { fit: "fill" })
      .png()
      .toBuffer();

    const targetPng = PNG.sync.read(targetProcessed);
    const outputPng = PNG.sync.read(outputProcessed);

    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(
      targetPng.data,
      outputPng.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );

    const totalPixels = width * height;
    const matchingPixels = totalPixels - numDiffPixels;
    const accuracy = (matchingPixels / totalPixels) * 100;

    const accuracyScore = Math.round(accuracy * 100) / 100;

    // Calculate total score based on accuracy and code efficiency
    const score = calculateScore(accuracyScore, code.length);

    const { data: submissionData, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        accuracy: accuracyScore,
        score: score,
        code: code,
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Submission error:", submissionError);

      if (submissionError.code === "42501" || submissionError.message.includes("row-level security")) {
        return {
          success: false,
          error: `Database policy error: ${submissionError.message}`,
        };
      }

      return {
        success: false,
        error: `Failed to save submission: ${submissionError.message}`,
      };
    }

    return {
      success: true,
      accuracy: accuracyScore,
      score: score,
      codeLength: code.length,
      submissionId: submissionData.id,
    };
  } catch (error) {
    console.error("Unexpected error during submission:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred during submission",
    };
  }
};

/**
 * Checks if the current user has achieved a perfect score (100% accuracy)
 * for a specific challenge.
 * 
 * @param challengeId - The ID of the challenge to check
 * @returns Object with success status and hasPerfectScore boolean
 */
export const checkUserHasPerfectScore = async (challengeId: string) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        hasPerfectScore: false,
      };
    }

    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("accuracy")
      .eq("challenge_id", challengeId)
      .eq("user_id", user.id)
      .eq("accuracy", 100)
      .limit(1);

    if (submissionsError) {
      console.error("Error checking perfect score:", submissionsError);
      return {
        success: false,
        hasPerfectScore: false,
      };
    }

    return {
      success: true,
      hasPerfectScore: submissions && submissions.length > 0,
    };
  } catch (error) {
    console.error("Unexpected error checking perfect score:", error);
    return {
      success: false,
      hasPerfectScore: false,
    };
  }
};

/**
 * Fetches all submissions for a specific challenge by the current user.
 * Returns submissions sorted by accuracy (descending) and code length (ascending).
 * 
 * @param challengeId - The ID of the challenge to fetch submissions for
 * @returns Object with success status and array of submissions or error message
 */
export const getMySubmissions = async (challengeId: string) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
        submissions: [],
      };
    }

    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("user_id", user.id);

    if (submissionsError) {
      console.error("Fetch submissions error:", submissionsError);
      return {
        success: false,
        error: `Failed to fetch submissions: ${submissionsError.message}`,
        submissions: [],
      };
    }

    const sortedSubmissions = (submissions || []).sort((a: Submission, b: Submission) => {
      if (b.accuracy !== a.accuracy) {
        return b.accuracy - a.accuracy;
      }
      return a.code.length - b.code.length;
    });

    return {
      success: true,
      submissions: sortedSubmissions,
    };
  } catch (error) {
    console.error("Unexpected error fetching submissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      submissions: [],
    };
  }
};

/**
 * Fetches top submissions for a specific challenge from all users.
 * Returns unique submissions per user (best submission only) with user information.
 * Sorted by accuracy (descending) and code length (ascending), limited to top 50.
 * 
 * @param challengeId - The ID of the challenge to fetch submissions for
 * @returns Object with success status and array of submissions with user info or error message
 */
/**
 * Fetches the user's best (highest score) submission for each challenge.
 * Used to display scores on challenge cards.
 * 
 * @param challengeIds - Array of challenge IDs to get best scores for
 * @returns Map of challengeId to best score
 */
export const getUserBestScores = async (challengeIds: string[]) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Return empty map if not authenticated
    if (userError || !user) {
      return {
        success: true,
        scores: new Map<string, number>(),
      };
    }

    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("challenge_id, score")
      .eq("user_id", user.id)
      .in("challenge_id", challengeIds);

    if (submissionsError) {
      console.error("Fetch user best scores error:", submissionsError);
      return {
        success: false,
        scores: new Map<string, number>(),
      };
    }

    // Find the best score for each challenge
    const scores = new Map<string, number>();
    for (const submission of submissions || []) {
      const currentBest = scores.get(submission.challenge_id) || 0;
      if ((submission.score || 0) > currentBest) {
        scores.set(submission.challenge_id, submission.score || 0);
      }
    }

    return {
      success: true,
      scores,
    };
  } catch (error) {
    console.error("Unexpected error fetching user best scores:", error);
    return {
      success: false,
      scores: new Map<string, number>(),
    };
  }
};

export const getTopSubmissions = async (challengeId: string) => {
  try {
    const supabase = await createClient();
    const { getBatchUserDisplayInfo } = await import("@/app/actions/user");

    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("*")
      .eq("challenge_id", challengeId);

    if (submissionsError) {
      console.error("Fetch top submissions error:", submissionsError);
      return {
        success: false,
        error: `Failed to fetch top submissions: ${submissionsError.message}`,
        submissions: [],
      };
    }

    if (!submissions || submissions.length === 0) {
      return {
        success: true,
        submissions: [],
      };
    }

    const sortedSubmissions = submissions.sort((a: Submission, b: Submission) => {
      if (b.accuracy !== a.accuracy) {
        return b.accuracy - a.accuracy;
      }
      return a.code.length - b.code.length;
    });

    const userBestSubmissions = new Map();

    for (const submission of sortedSubmissions) {
      const userId = submission.user_id;

      if (!userBestSubmissions.has(userId)) {
        userBestSubmissions.set(userId, submission);
      }
    }

    const uniqueUserIds = Array.from(userBestSubmissions.keys());

    const userInfoMap = await getBatchUserDisplayInfo(uniqueUserIds);

    const topSubmissions = Array.from(userBestSubmissions.values())
      .map((submission: Submission) => {
        const userInfo = userInfoMap.get(submission.user_id);
        return {
          ...submission,
          user_avatar_url: userInfo?.avatarUrl || null,
          user_full_name: userInfo?.displayName || "Anonymous",
        };
      })
      .sort((a: Submission, b: Submission) => {
        if (b.accuracy !== a.accuracy) {
          return b.accuracy - a.accuracy;
        }
        return a.code.length - b.code.length;
      })
      .slice(0, 50);

    return {
      success: true,
      submissions: topSubmissions,
    };
  } catch (error) {
    console.error("Unexpected error fetching top submissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      submissions: [],
    };
  }
};
