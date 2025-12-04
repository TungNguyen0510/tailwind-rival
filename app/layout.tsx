import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { Toaster } from "@/components/ui/sonner";
import { defaultUrl } from "@/constants/url";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Tailwind Rival",
  description:
    "The fun way to learn TailwindCSS. Replicate the target layouts using TailwindCSS and have fun!",
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
          <Toaster richColors position="top-right" closeButton expand />
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
