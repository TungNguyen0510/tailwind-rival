import { defaultUrl } from "@/constants/url";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Leaderboard - Tailwind Rival",
  description:
    "See the top players ranked by score and streak on Tailwind Rival",
  openGraph: {
    title: "Leaderboard - Tailwind Rival",
    description:
      "See the top players ranked by score and streak on Tailwind Rival",
    url: "/leaderboard",
    siteName: "Tailwind Rival",
    type: "website",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 900,
        alt: "Leaderboard - Tailwind Rival",
      },
    ],
  },
  twitter: {
    title: "Leaderboard - Tailwind Rival",
    description:
      "See the top players ranked by score and streak on Tailwind Rival",
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
