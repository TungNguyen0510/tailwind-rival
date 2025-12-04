import { defaultUrl } from "@/constants/url";
import { createClient } from "@/utils/supabase/server";
import { getLocalDateString } from "@/utils/utils";


const ogImageUrl = `${defaultUrl}/api/og/home`;

export const generateMetadata = async () => {
  const supabase = await createClient();
  const { data: todayChallenge } = await supabase
    .from("challenges")
    .select("*")
    .not("target_day", "is", null)
    .eq("target_day", getLocalDateString())
    .single();

  return {
    metadataBase: new URL(defaultUrl),
    title: "Daily Challenges - Tailwind Rival",
    description: "The funnest TailwindCSS game for web developers!",
    openGraph: {
      title: "Daily Challenges - Tailwind Rival",
      description: "The funnest TailwindCSS game for web developers!",
      url: "/daily",
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Daily Challenges - Tailwind Rival",
        },
      ],
    },
    twitter: {
      title: "Daily Challenges - Tailwind Rival",
      description: "The funnest TailwindCSS game for web developers!",
      url: "/daily",
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: ogImageUrl,
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
