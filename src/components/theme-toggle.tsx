"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const isDark = mounted && resolvedTheme === "dark";
  const t = useT();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={
        mounted
          ? isDark
            ? t.theme.switchToLight
            : t.theme.switchToDark
          : t.theme.toggle
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("relative text-primary", className)}
    >
      <Sun className="size-5 rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-5 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
