import Image from "next/image";

export function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * A customer's profile photo, or their initials on a solid disc when they
 * haven't uploaded one. `size` is the diameter in pixels.
 */
export function Avatar({
  name,
  url,
  size = 40,
  className = "",
}: {
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };

  if (url) {
    return (
      <span
        className={`relative shrink-0 overflow-hidden rounded-full bg-muted ${className}`}
        style={style}
      >
        <Image
          src={url}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-primary font-bold uppercase tracking-wide text-primary-foreground ${className}`}
      style={{ ...style, fontSize: Math.max(11, Math.round(size * 0.36)) }}
      aria-hidden
    >
      {initialsFrom(name)}
    </span>
  );
}
