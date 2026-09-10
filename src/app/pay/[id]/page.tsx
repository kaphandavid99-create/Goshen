import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentTracker } from "@/app/pay/[id]/payment-tracker";
import { prisma } from "@/lib/db/prisma";
import { getDict } from "@/lib/i18n/server";
import { requireUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Payment" };

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(`/pay/${id}`);

  const payment = await prisma.payment.findFirst({
    where: { id, order: { userId: user.id } },
    select: {
      id: true,
      method: true,
      status: true,
      amountCents: true,
      currency: true,
      phone: true,
      failureReason: true,
      order: { select: { id: true, orderNumber: true } },
    },
  });

  if (!payment || payment.method !== "MOMO") {
    notFound();
  }

  const t = await getDict();

  return (
    <main className="page-wrap max-w-lg flex-1 py-12">
      <p className="kicker">{t.pay.kicker}</p>
      <h1 className="page-title mt-1">{payment.order.orderNumber}</h1>
      <PaymentTracker
        paymentId={payment.id}
        orderId={payment.order.id}
        amountCents={payment.amountCents}
        phone={payment.phone}
        initialStatus={payment.status}
        initialReason={payment.failureReason}
      />
    </main>
  );
}
