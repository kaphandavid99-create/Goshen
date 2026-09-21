import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { isEmailConfigured } from "@/lib/env";
import { formatFlavorSummary, normalizeFlavorQuantities } from "@/lib/flavors";
import { formatPrice } from "@/lib/money";
import { orderItemBundleInclude } from "@/server/orders/queries";
import { sendEmail } from "@/server/email/resend";

type ReceiptOrderItem = Prisma.OrderItemGetPayload<{
  include: typeof orderItemBundleInclude;
}>;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function getOrderForReceipt(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: orderItemBundleInclude },
      user: { select: { email: true, name: true } },
    },
  });
}

function itemLine(item: ReceiptOrderItem) {
  const flavors = formatFlavorSummary(normalizeFlavorQuantities(item.flavors));
  const bundle =
    item.product?.kind === "BUNDLE" && item.product.bundleItems.length > 0
      ? item.product.bundleItems
          .map((part) => `${part.quantity}× ${part.product.name}`)
          .join(", ")
      : null;
  return { name: item.name, quantity: item.quantity, flavors, bundle, lineTotal: item.priceCents * item.quantity };
}

/**
 * Email the customer a receipt once they've confirmed an order was
 * delivered — their record of what they paid and what was in it. Best
 * effort by design: callers should never let a failure here block the
 * receive-confirmation itself.
 */
export async function sendOrderReceiptEmail(orderId: string) {
  if (!isEmailConfigured()) {
    return;
  }

  const order = await getOrderForReceipt(orderId);
  if (!order || !order.user.email) {
    return;
  }

  const lines = order.items.map(itemLine);
  const receivedAt = order.receivedAt ?? new Date();

  const rowsHtml = lines
    .map((line) => {
      const detail = [line.flavors, line.bundle ? `Contains: ${line.bundle}` : null]
        .filter(Boolean)
        .map((d) => `<div style="color:#6b7280;font-size:12px;margin-top:2px;">${escapeHtml(d as string)}</div>`)
        .join("");
      return `
        <tr>
          <td style="padding:8px 0;">
            ${escapeHtml(line.name)} × ${line.quantity}
            ${detail}
          </td>
          <td style="padding:8px 0;text-align:right;white-space:nowrap;">${formatPrice(line.lineTotal)}</td>
        </tr>`;
    })
    .join("");

  const rowsText = lines
    .map((line) => {
      const detail = [line.flavors, line.bundle ? `Contains: ${line.bundle}` : null]
        .filter(Boolean)
        .join("; ");
      return `${line.name} × ${line.quantity}${detail ? ` (${detail})` : ""}: ${formatPrice(line.lineTotal)}`;
    })
    .join("\n");

  const summaryRows: [string, string][] = [
    ["Subtotal", formatPrice(order.subtotalCents)],
    [
      "Delivery",
      order.deliveryCents === 0 ? "Free" : formatPrice(order.deliveryCents),
    ],
    ...(order.discountCents > 0
      ? ([["Points discount", `−${formatPrice(order.discountCents)}`]] as [string, string][])
      : []),
    ["Total", formatPrice(order.totalCents)],
  ];

  const subject = `Your Goshen receipt: ${order.orderNumber}`;

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#111827;">
      <h1 style="font-size:18px;margin-bottom:4px;">Thanks for confirming, ${escapeHtml(order.user.name)}!</h1>
      <p style="color:#6b7280;font-size:14px;margin-top:0;">
        This is your receipt for order <strong>${escapeHtml(order.orderNumber)}</strong>,
        confirmed received on ${receivedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
        Keep it for your records.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
        ${rowsHtml}
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:14px;">
        ${summaryRows
          .map(
            ([label, value], i) => `
          <tr>
            <td style="padding:2px 0;${i === summaryRows.length - 1 ? "font-weight:700;" : ""}">${label}</td>
            <td style="padding:2px 0;text-align:right;${i === summaryRows.length - 1 ? "font-weight:700;" : ""}">${value}</td>
          </tr>`,
          )
          .join("")}
      </table>
      <p style="color:#6b7280;font-size:12px;margin-top:24px;">
        Delivered to: ${escapeHtml(order.fullName)}${order.address ? `, ${escapeHtml(order.address)}` : ""}<br />
        Questions about this order? Just reply to this email or reach us on WhatsApp.
      </p>
    </div>`;

  const text = [
    `Thanks for confirming, ${order.user.name}!`,
    `Receipt for order ${order.orderNumber}, confirmed received on ${receivedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`,
    "",
    rowsText,
    "",
    ...summaryRows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Delivered to: ${order.fullName}${order.address ? `, ${order.address}` : ""}`,
  ].join("\n");

  await sendEmail({ to: order.user.email, subject, html, text });
}
