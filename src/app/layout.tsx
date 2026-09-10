import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { ScrollToHash } from "@/components/layout/scroll-to-hash";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StoreChrome } from "@/components/layout/store-chrome";
import { PageTransition } from "@/components/motion/page-transition";
import { ThemeProvider } from "@/components/theme-provider";
import { LOCALE_BCP47 } from "@/lib/i18n/config";
import { LanguageProvider } from "@/lib/i18n/context";
import { getLocale } from "@/lib/i18n/server";
import { APP_NAME, BRAND_COLORS } from "@/lib/constants";
import { env } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-loaded",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: BRAND_COLORS.green,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    metadataBase: new URL(env.appUrl),
    applicationName: APP_NAME,
    title: {
      default: "Goshen",
      template: "%s · Goshen",
    },
    description:
      locale === "fr"
        ? "Alimentation, maison et soins personnels à New Bell, Bamenda."
        : "Groceries, household, and personal care from New Bell, Bamenda.",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: APP_NAME,
    },
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={LOCALE_BCP47[locale]}
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LanguageProvider locale={locale}>
          <ThemeProvider>
            <ScrollToHash />
            <StoreChrome header={<SiteHeader />} footer={<SiteFooter />}>
              <PageTransition>{children}</PageTransition>
            </StoreChrome>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
