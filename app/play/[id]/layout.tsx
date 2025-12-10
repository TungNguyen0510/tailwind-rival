import { Challenge } from "@/types/challenge";
import { createClient } from "@/utils/supabase/server";
import { defaultUrl } from "@/constants/url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: challenge } = (await supabase
    .from("challenges")
    .select("*")
    .eq("id", id)
    .single()) as { data: Challenge };

  const ogImageUrl = `${defaultUrl}/api/og/play/${id}`;

  return {
    title: `Challenge (${challenge?.target_day || "Unknown"}) - Tailwind Rival`,
    description: "The funnest TailwindCSS game for web developers!",
    openGraph: {
      title: `Challenge (${challenge?.target_day || "Unknown"}) - Tailwind Rival`,
      description: "The funnest TailwindCSS game for web developers!",
      url: `/play/${id}`,
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Challenge #${challenge.target_day} - Tailwind Rival`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Challenge #${challenge.target_day} - Tailwind Rival`,
      description: "The funnest TailwindCSS game for web developers!",
      images: [ogImageUrl],
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
