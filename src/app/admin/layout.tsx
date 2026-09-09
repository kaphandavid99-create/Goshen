import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireStaff } from "@/server/admin/access";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin · Goshen",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireStaff();

  return <AdminShell user={user}>{children}</AdminShell>;
}
