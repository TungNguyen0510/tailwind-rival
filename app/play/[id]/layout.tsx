import { Challenge } from "@/types/challenge";
import { createClient } from "@/utils/supabase/server";

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

  return {
    title: `Target (${challenge.target_day}) - Tailwind Rival`,
    description: `Play the challenge for ${challenge.target_day} on Tailwind Rival`,
    openGraph: {
      title: `Target (${challenge.target_day}) - Tailwind Rival`,
      description: `Play the challenge for ${challenge.target_day}`,
      url: `/play/${id}`,
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: challenge.image,
          width: 1200,
          height: 900,
          alt: `Target (${challenge.target_day}) - Tailwind Rival`,
        },
      ],
    },
    twitter: {
      title: `Play (${challenge.target_day}) - Tailwind Rival`,
      description: `Play the challenge for ${challenge.target_day}`,
      url: `/play/${id}`,
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: challenge.image,
          width: 1200,
          height: 900,
          alt: `Target (${challenge.target_day}) - Tailwind Rival`,
        },
      ],
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
