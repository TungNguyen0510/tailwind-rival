import { defaultUrl } from "@/constants/url";
import { createClient } from "@/utils/supabase/server";

export const generateMetadata = async () => {
  const supabase = await createClient();
  const { data: todayChallenge } = await supabase
    .from("challenges")
    .select("*")
    .not("target_day", "is", null)
    .eq("target_day", new Date().toISOString().split("T")[0])
    .single();

  return {
    metadataBase: new URL(defaultUrl),
    title: "Daily Challenges - Tailwind Rival",
    description: "Daily challenges to improve your skills!",
    openGraph: {
      title: "Daily Challenges - Tailwind Rival",
      description: "Daily challenges to improve your skills!",
      url: "/daily",
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: todayChallenge?.image || "/favicon.ico",
          width: 1200,
          height: 630,
          alt: "Daily Challenges - Tailwind Rival",
        },
      ],
    },
    twitter: {
      title: "Daily Challenges - Tailwind Rival",
      description: "Daily challenges to improve your skills!",
      url: "/daily",
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: todayChallenge?.image || "/favicon.ico",
          width: 1200,
          height: 630,
          alt: "Daily Challenges - Tailwind Rival",
        },
      ],
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
};

export default function DailyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
