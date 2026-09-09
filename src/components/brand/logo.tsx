import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={APP_NAME}>
      <Image
        src="/logo.png"
        alt=""
        width={160}
        height={160}
        priority
        className={
          compact
            ? "h-12 w-12 object-contain"
            : "h-14 w-14 object-contain sm:h-16 sm:w-16"
        }
      />
      {compact ? null : (
        <span className="font-semibold tracking-tight text-primary">
          <span className="block text-lg leading-none">{APP_NAME}</span>
          <span className="text-[11px] font-medium text-muted-foreground">
            Grocery & household
          </span>
        </span>
      )}
    </Link>
  );
}
