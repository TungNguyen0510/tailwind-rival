import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  let baseUrl: string;

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    baseUrl = requestUrl.origin;
  }

  if (redirectTo) {
    return NextResponse.redirect(`${baseUrl}${redirectTo}`);
  }

  // Default redirect to home page after sign up/sign in
  return NextResponse.redirect(baseUrl);
}
