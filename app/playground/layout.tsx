import { defaultUrl } from "@/constants/url";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Playground - Tailwind Rival",
  description: "Create designs, download them, and have fun!",
  openGraph: {
    title: "Playground - Tailwind Rival",
    description: "Create designs, download them, and have fun!",
    url: "/playground",
    siteName: "Tailwind Rival",
    type: "website",
  },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
