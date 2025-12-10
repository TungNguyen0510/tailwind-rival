import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function Settings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  return <SettingsClient />;
}
