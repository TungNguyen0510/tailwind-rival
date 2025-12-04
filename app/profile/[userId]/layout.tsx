import { getUserDisplayInfo } from "@/app/actions";
import { defaultUrl } from "@/constants/url";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;

  const userInfo = await getUserDisplayInfo(userId);

  const ogImageUrl = `${defaultUrl}/api/og/profile/${userId}`;

  return {
    title: `${userInfo.displayName}'s Profile - Tailwind Rival`,
    description: "The funnest TailwindCSS game for web developers!",
    openGraph: {
      title: `${userInfo.displayName}'s Profile - Tailwind Rival`,
      description: "The funnest TailwindCSS game for web developers!",
      url: `/profile/${userId}`,
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${userInfo.displayName}'s Profile - Tailwind Rival`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${userInfo.displayName}'s Profile - Tailwind Rival`,
      description: `Check out ${userInfo.displayName}'s profile on Tailwind Rival - The funnest TailwindCSS game for web developers!`,
      images: [ogImageUrl],
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
};
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
