import { orderStatusLabel } from "@/lib/order-status";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "RECEIVED"
      ? "bg-primary text-primary-foreground"
      : status === "CONFIRMED"
        ? "bg-primary text-primary-foreground"
        : status === "CANCELLED"
          ? "bg-muted text-muted-foreground"
          : "bg-accent text-accent-foreground";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {orderStatusLabel(status)}
    </span>
  );
}
