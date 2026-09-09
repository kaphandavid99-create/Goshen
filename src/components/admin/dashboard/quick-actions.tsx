import Link from "next/link";
import {
  Boxes,
  ClipboardList,
  Gift,
  ImageIcon,
  MessageSquareText,
  PackagePlus,
  Star,
  Users,
} from "lucide-react";

const ACTIONS = [
  { href: "/admin/products/new", label: "Add product", icon: PackagePlus },
  { href: "/admin/orders", label: "View orders", icon: ClipboardList },
  { href: "/admin/products", label: "Manage products", icon: Boxes },
  { href: "/admin/inventory", label: "Manage inventory", icon: Star },
  { href: "/admin/customers", label: "View customers", icon: Users },
  { href: "/admin/wholesale", label: "Wholesale", icon: Gift },
  { href: "/admin/hero", label: "Homepage content", icon: ImageIcon },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
] as const;

export function QuickActions() {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="section-title">Quick actions</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-muted"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
              <a.icon className="size-4" />
            </span>
            {a.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
