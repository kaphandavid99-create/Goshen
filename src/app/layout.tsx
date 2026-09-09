import type { Metadata } from "next";
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
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-loaded",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: {
      default: "Goshen",
      template: "%s · Goshen",
    },
    description:
      locale === "fr"
        ? "Alimentation, maison et soins personnels à New Bell, Bamenda."
        : "Groceries, household, and personal care from New Bell, Bamenda.",
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
