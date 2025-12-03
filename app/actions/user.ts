"use server";

import { UserDisplayInfo, UserSettings } from "@/types/user-settings";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

/**
 * User display information
 * Prioritizes user_settings over user_metadata
 */


/**
 * Get user display information
 * Priority: user_settings.avatar_url/display_name > user.user_metadata
 * 
 * @param userId - The user ID to fetch info for
 * @returns User display information with avatar and name
 */
export const getUserDisplayInfo = async (
  userId: string
): Promise<UserDisplayInfo> => {
  const supabase = await createClient();

  // Fetch user settings first (highest priority)
  const { data: settings } = await supabase
    .from("user_settings")
    .select("avatar_url, display_name")
    .eq("user_id", userId)
    .single();

  // If user_settings has values, use them
  if (settings) {
    return {
      userId,
      avatarUrl: settings.avatar_url || null,
      displayName: settings.display_name || "User",
    };
  }

  // Fallback to user_metadata from auth.users
  const { adminAuthClient } = await import("@/utils/supabase/admin");
  const { data } = await adminAuthClient.getUserById(userId);

  if (data?.user) {
    return {
      userId,
      avatarUrl: data.user.user_metadata?.avatar_url || null,
      displayName: data.user.user_metadata?.full_name || "User",
    };
  }

  // Default fallback
  return {
    userId,
    avatarUrl: null,
    displayName: "User",
  };
};

/**
 * Get full user settings information
 * Priority: user_settings table > user_metadata (fallback)
 * 
 * When user hasn't saved any settings yet, returns default values from user_metadata
 * Once user saves settings, data will be retrieved from user_settings table
 * 
 * @param userId - The user ID to fetch settings for
 * @returns Full user settings or null if user doesn't exist
 */
export const getFullUserSettingsInfo = async (
  userId: string
): Promise<UserSettings | null> => {
  const supabase = await createClient();

  // Try to get settings from user_settings table first (highest priority)
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  // If user_settings exists, use it (user has saved settings before)
  if (settings) {
    return settings as UserSettings;
  }

  // Fallback to user_metadata from auth.users (for users who haven't saved settings yet)
  const { adminAuthClient } = await import("@/utils/supabase/admin");
  const { data } = await adminAuthClient.getUserById(userId);

  if (data?.user) {
    // Return default settings structure with data from user_metadata
    return {
      user_id: userId,
      avatar_url: data.user.user_metadata?.avatar_url || null,
      display_name: data.user.user_metadata?.full_name || null,
      website: null,
      twitter: null,
      github: null,
      codepen: null,
      linkedin: null,
      instagram: null,
      youtube: null,
      twitch: null,
      facebook: null,
    } as UserSettings;
  }

  // User doesn't exist in auth system
  return null;
};

/**
 * Get user display info from User object (for client-side components)
 * Priority: user_settings > user_metadata
 * 
 * @param user - Supabase User object
 * @returns User display information
 */
export const getUserDisplayInfoFromUser = async (
  user: User
): Promise<UserDisplayInfo> => {
  return getUserDisplayInfo(user.id);
};

/**
 * Get multiple users' display info in batch
 * Efficient for fetching info for multiple users at once
 * 
 * @param userIds - Array of user IDs
 * @returns Map of userId to UserDisplayInfo
 */
export const getBatchUserDisplayInfo = async (
  userIds: string[]
): Promise<Map<string, UserDisplayInfo>> => {
  const supabase = await createClient();
  const { adminAuthClient } = await import("@/utils/supabase/admin");

  // Fetch all user_settings in one query
  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("user_id, avatar_url, display_name")
    .in("user_id", userIds);

  // Create map from settings
  const settingsMap = new Map<string, { avatar_url: string | null; display_name: string | null }>();
  settingsData?.forEach((s) => {
    settingsMap.set(s.user_id, {
      avatar_url: s.avatar_url,
      display_name: s.display_name,
    });
  });

  // For users without settings, fetch from auth
  const usersWithoutSettings = userIds.filter((id) => !settingsMap.has(id));
  const authUsersMap = new Map<string, { avatar_url: string | null; full_name: string | null }>();

  for (const userId of usersWithoutSettings) {
    try {
      const { data } = await adminAuthClient.getUserById(userId);
      if (data?.user) {
        authUsersMap.set(userId, {
          avatar_url: data.user.user_metadata?.avatar_url || null,
          full_name: data.user.user_metadata?.full_name || null,
        });
      }
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
    }
  }

  // Combine results
  const resultMap = new Map<string, UserDisplayInfo>();

  userIds.forEach((userId) => {
    const settings = settingsMap.get(userId);
    const authUser = authUsersMap.get(userId);

    resultMap.set(userId, {
      userId,
      avatarUrl: settings?.avatar_url || authUser?.avatar_url || null,
      displayName: settings?.display_name || authUser?.full_name || "User",
    });
  });

  return resultMap;
};

