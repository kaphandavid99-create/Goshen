"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// next-themes injects an inline <script> to set the theme class before
// paint (avoids a flash of the wrong theme). On React 19, that script tag
// sometimes gets recreated on the client instead of hydrated in place,
// which logs this specific, harmless console.error — but Next's dev
// overlay turns any console.error during render into a full-screen
// redbox, hiding the rest of the page behind it. next-themes has no
// stable release yet that avoids this (fixed only in an unreleased
// 1.0.0-beta), so filter out just this one known message here.
if (typeof window !== "undefined") {
  const w = window as unknown as { __themeScriptWarningPatched?: boolean };
  if (!w.__themeScriptWarningPatched) {
    w.__themeScriptWarningPatched = true;
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("Encountered a script tag while rendering React component")
      ) {
        return;
      }
      originalError(...args);
    };
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
