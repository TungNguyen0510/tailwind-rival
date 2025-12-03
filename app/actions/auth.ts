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
  const referer = headersList.get("referer");

  // Determine the path to redirect to after successful login
  let redirectToPath = "/";

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      redirectToPath = `${refererUrl.pathname}${refererUrl.search}`;
    } catch (e) {
      // If referer parsing fails, default to home page
      redirectToPath = "/";
    }
  }

  let baseUrl: string;

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "http";
    baseUrl = `${protocol}://${host}`;
  }

  const authCallbackUrl = `${baseUrl}/auth/callback?redirect_to=${encodeURIComponent(
    redirectToPath
  )}`;

  const supabase = await createClient();

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
