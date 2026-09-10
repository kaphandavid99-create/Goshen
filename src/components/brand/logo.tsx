import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    // Mobile: logo with the full brand name tucked directly beneath it. Sized
    // so the stack matches the old logo height and the navbar doesn't grow.
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
          className="h-9 w-9 object-contain"
        />
        <span className="whitespace-nowrap text-[10.5px] font-bold uppercase leading-none tracking-wide text-primary">
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
