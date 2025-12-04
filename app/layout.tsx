import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "@/app/globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { Toaster } from "@/components/ui/sonner";
import { defaultUrl } from "@/constants/url";

const ogImageUrl = `${defaultUrl}/api/og/home`;

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Tailwind Rival",
  description: "The funnest TailwindCSS game for web developers!",
  openGraph: {
    title: "Tailwind Rival",
    description: "The funnest TailwindCSS game for web developers!",
    url: "/",
    siteName: "Tailwind Rival",
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Tailwind Rival",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tailwind Rival",
    description: "The funnest TailwindCSS game for web developers!",
    images: [ogImageUrl],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors position="top-right" expand />
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
