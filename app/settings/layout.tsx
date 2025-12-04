import { defaultUrl } from "@/constants/url";

const ogImageUrl = `${defaultUrl}/api/og/home`;

export const generateMetadata = async () => {
  return {
    metadataBase: new URL(defaultUrl),
    title: "Settings - Tailwind Rival",
    description: "The funnest TailwindCSS game for web developers!",
    openGraph: {
      title: "Settings - Tailwind Rival",
      description: "The funnest TailwindCSS game for web developers!",
      url: "/settings",
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Settings - Tailwind Rival",
        },
      ],
    },
    twitter: {
      title: "Settings - Tailwind Rival",
      description: "The funnest TailwindCSS game for web developers!",
      url: "/settings",
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Settings - Tailwind Rival",
        },
      ],
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
