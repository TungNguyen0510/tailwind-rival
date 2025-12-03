"use server";

import { UserSettings } from "@/types/user-settings";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Saves or updates user settings in the database
 * Uses upsert to create new record or update existing one
 * 
 * @param settings - User settings data to save (excluding user_id)
 * @returns Object with success status and optional error message
 */
export const saveUserSettings = async (
  settings: Omit<UserSettings, "user_id">
) => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please log in to save settings.",
      };
    }

    // Upsert user settings (insert new record or update existing one)
    // user_id is the primary key, so it will update if exists, insert if not
    const { error: upsertError } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id", // Use user_id as conflict resolution key
          ignoreDuplicates: false, // Always update if record exists
        }
      );

    if (upsertError) {
      console.error("Settings upsert error:", upsertError);
      return {
        success: false,
        error: `Failed to save settings: ${upsertError.message}`,
      };
    }

    revalidatePath(`/profile/${user.id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error saving settings:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while saving settings",
    };
  }
};

/**
 * Retrieves user settings from the database
 * 
 * @returns Object with success status and user settings data or error message
 */
export const getUserSettings = async () => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please log in to view settings.",
        settings: null,
      };
    }

    // Fetch user settings
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (settingsError) {
      // If no settings found, return default values
      if (settingsError.code === "PGRST116") {
        return {
          success: true,
          settings: {
            user_id: user.id,
            avatar_url: user.user_metadata?.avatar_url || null,
            display_name: user.user_metadata?.full_name || null,
            website: null,
            twitter: null,
            github: null,
            codepen: null,
            linkedin: null,
            instagram: null,
            youtube: null,
            twitch: null,
            facebook: null,
          } as UserSettings,
        };
      }

      console.error("Settings fetch error:", settingsError);
      return {
        success: false,
        error: `Failed to fetch settings: ${settingsError.message}`,
        settings: null,
      };
    }

    return {
      success: true,
      settings: settings as UserSettings,
    };
  } catch (error) {
    console.error("Unexpected error fetching settings:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while fetching settings",
      settings: null,
    };
  }
};
