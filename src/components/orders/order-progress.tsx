import { getI18n } from "@/lib/i18n/server";
import { orderStatusLabel } from "@/lib/order-status";

function stepIndex(status: string) {
  if (status === "RECEIVED") return 2;
  if (status === "CONFIRMED") return 1;
  if (status === "PENDING") return 0;
  return -1;
}

export async function OrderProgress({ status }: { status: string }) {
  const { locale, t } = await getI18n();

  if (status === "CANCELLED") {
    return (
      <p className="text-sm text-muted-foreground">
        {t.orders.progress.cancelled}
      </p>
    );
  }

  const steps = [
    { key: "PENDING", label: t.orders.progress.placed },
    { key: "CONFIRMED", label: t.orders.progress.accepted },
    { key: "RECEIVED", label: t.orders.progress.received },
  ] as const;

  const current = stepIndex(status);

  return (
    <ol className="grid grid-cols-3 gap-2 text-center text-xs">
      {steps.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step.key} className="min-w-0">
            <span
              className={`mx-auto mb-2 block h-1.5 rounded-full ${
                done ? "bg-primary" : "bg-border"
              }`}
            />
            <span className={done ? "font-semibold text-primary" : "text-muted-foreground"}>
              {step.label}
            </span>
          </li>
        );
      })}
      <span className="sr-only">
        {t.orders.progress.statusSr(orderStatusLabel(status, locale))}
      </span>
    </ol>
  );
}
