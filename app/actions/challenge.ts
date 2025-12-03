"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Creates a new challenge by uploading an image to Supabase storage
 * and creating a record in the challenges table.
 * 
 * @param imageBase64 - Base64 encoded image data (data URL format)
 * @param solution - The HTML/CSS solution code
 * @param colors - Array of color values used in the challenge
 * @returns Object with success status and challenge ID or error message
 */
export const createChallenge = async (
  imageBase64: string,
  solution: string,
  colors: string[]
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
        error: "User not authenticated. Please log in to create a challenge.",
      };
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${user.id}-${timestamp}-${randomString}.png`;

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("targets")
      .upload(filename, imageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        success: false,
        error: `Failed to upload image: ${uploadError.message}. Please check if the "targets" bucket exists and has proper RLS policies configured.`,
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("targets").getPublicUrl(filename);

    const { data: challengeData, error: challengeError } = await supabase
      .from("challenges")
      .insert({
        user_created: user.id,
        image: publicUrl,
        solution: solution,
        colors: colors,
      })
      .select()
      .single();

    if (challengeError) {
      console.error("Challenge creation error:", challengeError);

      try {
        await supabase.storage.from("targets").remove([filename]);
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded image:", cleanupError);
      }

      if (challengeError.code === "42501" || challengeError.message.includes("row-level security")) {
        return {
          success: false,
          error: `Database policy error: ${challengeError.message}.`,
        };
      }

      return {
        success: false,
        error: `Failed to create challenge: ${challengeError.message}`,
      };
    }

    return {
      success: true,
      challengeId: challengeData.id,
      imageUrl: publicUrl,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
