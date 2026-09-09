import Image from "next/image";
import type { CatalogProductImage } from "@/types/catalog";

export function ProductMedia({
  media,
  sizes,
  priority = false,
  className,
}: {
  media: CatalogProductImage;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (media.resourceType === "video") {
    return (
      <video
        src={media.url}
        className={className ?? "size-full object-contain"}
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <Image
      src={media.url}
      alt={media.alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className ?? "object-contain p-4"}
    />
  );
}

export function primaryMedia(images: CatalogProductImage[]) {
  return images.find((item) => item.resourceType !== "video") ?? images[0];
}
