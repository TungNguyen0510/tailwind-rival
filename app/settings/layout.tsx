export const generateMetadata = async () => {
  return {
    title: "Settings Your Profile - Tailwind Rival",
    description: "Settings for Tailwind Rival",
    openGraph: {
      title: "Settings Your Profile - Tailwind Rival",
      description: "Settings for Tailwind Rival",
      url: "/settings",
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: "/favicon.ico",
          width: 1200,
          height: 630,
          alt: "Settings - Tailwind Rival",
        },
      ],
    },
    twitter: {
      title: "Settings Your Profile - Tailwind Rival",
      description: "Settings for Tailwind Rival",
      url: "/settings",
      siteName: "Tailwind Rival",
      type: "website",
      images: [
        {
          url: "/favicon.ico",
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
