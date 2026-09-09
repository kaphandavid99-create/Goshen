import type { OrderStatus } from "@prisma/client";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function orderStatusLabel(status: string, locale: Locale = DEFAULT_LOCALE) {
  const labels = getDictionary(locale).orderStatus;
  if (status in labels) {
    return labels[status as keyof typeof labels];
  }
  return status;
}

export function canAdminSetStatus(current: OrderStatus, next: OrderStatus) {
  if (current === "CANCELLED" || current === "RECEIVED") {
    return false;
  }

  if (next === "CONFIRMED") {
    return current === "PENDING";
  }

  if (next === "CANCELLED") {
    return current === "PENDING" || current === "CONFIRMED";
  }

  return false;
}

export function canCustomerReceive(status: OrderStatus) {
  return status === "CONFIRMED";
}

export function canLeaveFeedback(status: OrderStatus) {
  return status === "RECEIVED";
}
