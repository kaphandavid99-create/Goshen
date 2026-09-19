import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import { VisitTracker } from "@/components/analytics/visit-tracker";
import { ScrollToHash } from "@/components/layout/scroll-to-hash";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StoreChrome } from "@/components/layout/store-chrome";
import { PageTransition } from "@/components/motion/page-transition";
import { InstallBanner } from "@/components/pwa/install-banner";
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

// Distinctive display serif, used only for the "Goshen Provision" wordmark
// in the mobile navbar.
const fraunces = Fraunces({
  variable: "--font-brand-loaded",
  subsets: ["latin"],
  style: ["italic"],
});

// High-contrast display serif, used for the navbar links. Self-hosted
// (rather than next/font/google) since this variable font file is fixed
// and doesn't need Google's CDN at build/dev time.
const playfair = localFont({
  src: "../fonts/PlayfairDisplay-Variable.woff2",
  variable: "--font-nav-loaded",
  weight: "400 900",
  display: "swap",
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
      className={`${inter.variable} ${geistMono.variable} ${fraunces.variable} ${playfair.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LanguageProvider locale={locale}>
          <ThemeProvider>
            <ScrollToHash />
            <VisitTracker />
            <StoreChrome header={<SiteHeader />} footer={<SiteFooter />}>
              <PageTransition>{children}</PageTransition>
            </StoreChrome>
            <InstallBanner />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
