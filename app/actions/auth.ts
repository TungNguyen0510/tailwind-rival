"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Initiates OAuth sign-in flow for GitHub or Google.
 * Redirects user to OAuth provider and handles callback.
 * 
 * @param provider - OAuth provider ("github" or "google")
 */
export const signInWithOAuth = async (provider: "github" | "google") => {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const referer = headersList.get("referer");

  let redirectToPath = "/";

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      redirectToPath = `${refererUrl.pathname}${refererUrl.search}`;
    } catch (e) {
      redirectToPath = "/";
    }
  }

  const supabase = await createClient();

  const authCallbackUrl = `${protocol}://${host}/auth/callback?redirect_to=${encodeURIComponent(
    redirectToPath
  )}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: authCallbackUrl,
    },
  });

  if (error) {
    console.log(error.message);
    return;
  }
  return redirect(data.url);
};

/**
 * Signs out the current user and clears their session.
 */
export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
};
