import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    // Mobile: logo with the full brand name tucked directly beneath it —
    // slightly larger mark, a slow full spin every 7s, and a stylish
    // display-serif wordmark (mobile only).
    return (
      <Link
        href="/"
        className="flex flex-col items-center gap-0.5"
        aria-label={APP_NAME}
      >
        <Image
          src="/logo.png"
          alt=""
          width={160}
          height={160}
          priority
          className="logo-spin-mobile h-11 w-11 object-contain"
        />
        <span className="whitespace-nowrap font-display text-[13px] italic leading-none tracking-wide text-primary">
          Goshen Provision
        </span>
      </Link>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={APP_NAME}>
      <Image
        src="/logo.png"
        alt=""
        width={160}
        height={160}
        priority
        className="h-14 w-14 object-contain sm:h-16 sm:w-16"
      />
      <span className="font-semibold tracking-tight text-primary">
        <span className="block text-lg leading-none">{APP_NAME}</span>
        <span className="text-[11px] font-medium text-muted-foreground">
          Grocery & household
        </span>
      </span>
    </Link>
  );
}
