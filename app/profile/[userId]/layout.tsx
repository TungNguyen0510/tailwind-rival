import { getUserDisplayInfo } from "@/app/actions";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;

  // Get user display info (prioritizes user_settings over user_metadata)
  const userInfo = await getUserDisplayInfo(userId);

  return {
    title: `${userInfo.displayName}'s Profile - Tailwind Rival`,
    description: `${userInfo.displayName}'s profile on Tailwind Rival`,
    openGraph: {
      title: `${userInfo.displayName}'s Profile - Tailwind Rival`,
      description: `${userInfo.displayName}'s profile on Tailwind Rival`,
      url: `/profile/${userId}`,
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: userInfo.avatarUrl || "/favicon.ico",
          width: 1200,
          height: 900,
          alt: `${userInfo.displayName}'s Profile - Tailwind Rival`,
        },
      ],
    },
    twitter: {
      title: `${userInfo.displayName}'s Profile - Tailwind Rival`,
      description: `${userInfo.displayName}'s profile on Tailwind Rival`,
      url: `/profile/${userId}`,
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: userInfo.avatarUrl || "/favicon.ico",
          width: 1200,
          height: 900,
          alt: `${userInfo.displayName}'s Profile - Tailwind Rival`,
        },
      ],
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
