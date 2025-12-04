import { defaultUrl } from "@/constants/url";

const ogImageUrl = `${defaultUrl}/api/og/home`;

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Playground - Tailwind Rival",
  description: "The playground to create and download your TailwindCSS designs!",
  openGraph: {
    title: "Playground - Tailwind Rival",
    description: "The playground to create and download your TailwindCSS designs!",
    url: "/playground",
    siteName: "Tailwind Rival",
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Playground - Tailwind Rival",
      },
    ],
  },
  twitter: {
    title: "Playground - Tailwind Rival",
    description: "The playground to create and download your TailwindCSS designs!",
    card: "summary_large_image",
    images: [ogImageUrl],
  },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
