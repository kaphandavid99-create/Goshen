import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function icon(props: IconProps) {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2c1.4-2.8 3.8-4.2 7-4.2s5.6 1.4 7 4.2" />
    </svg>
  );
}

export function IconCart(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M4 5h2l1.2 9.2a2 2 0 0 0 2 1.8h7.4a2 2 0 0 0 2-1.6L20 8H7" />
      <circle cx="9.5" cy="20" r="1.2" />
      <circle cx="17" cy="20" r="1.2" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconGift(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <rect x="4" y="8" width="16" height="12" rx="1.5" />
      <path d="M4 12h16M12 8v12M12 8c0-2-1.4-3.5-3.2-3.5S5.5 6 5.5 8M12 8c0-2 1.4-3.5 3.2-3.5S18.5 6 18.5 8" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 1.5" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M7 4h3l1 4-2 1.5a12 12 0 0 0 5.5 5.5L16 13l4 1v3c0 1-1 2-2.2 2C9.5 19 5 14.5 5 6.2 5 5 6 4 7 4Z" />
    </svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 8.5 4.2-1.1 7-4.3 7-8.5V6l-7-3Z" />
    </svg>
  );
}

export function IconTruck(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

export function IconLeaf(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14Z" />
      <path d="M5 19c3-6 8-11 14-14" />
    </svg>
  );
}

export function IconTag(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M3 12 12 3h7v7l-9 9-7-7Z" />
      <circle cx="16.5" cy="6.5" r="1" />
    </svg>
  );
}

export function IconFilter(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconBox(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M4 8 12 4l8 4-8 4-8-4Z" />
      <path d="M4 8v8l8 4 8-4V8" />
      <path d="M12 12v8" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.8-2.6 2.8-4 5.5-4s4.7 1.4 5.5 4" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M20.5 19c-.5-2-1.8-3.2-3.8-3.6" />
    </svg>
  );
}

export function IconClipboard(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <rect x="6" y="5" width="12" height="15" rx="1.5" />
      <path d="M9 5V4h6v1" />
      <path d="M9 10h6M9 14h4" />
    </svg>
  );
}

export function IconStar(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="m12 4 2.1 4.4 4.9.7-3.5 3.4.8 4.8L12 15.6 7.7 17.3l.8-4.8L5 9.1l4.9-.7L12 4Z" />
    </svg>
  );
}

export function IconHeart(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M12 19s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 2.8C19 14.6 12 19 12 19Z" />
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

export function IconCake(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M4 20h16M5 20v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6" />
      <path d="M5 15c1.2 1 2 1 3.2 0 1.2-1 2-1 3.2 0 1.2 1 2 1 3.2 0 1.2-1 2-1 3.2 0" />
      <path d="M12 8.5V6M12 4.5a1 1 0 1 0 0 .01" />
    </svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <svg {...icon(props)}>
      <path d="M6 16h12l-1.2-2.2V10a4.8 4.8 0 0 0-9.6 0v3.8L6 16Z" />
      <path d="M10 16a2 2 0 0 0 4 0" />
    </svg>
  );
}
