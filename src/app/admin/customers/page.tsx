import type { Metadata } from "next";
import { Avatar } from "@/components/account/avatar";
import { formatDate } from "@/lib/dates";
import { formatPrice } from "@/lib/money";
import { listAdminCustomers } from "@/server/admin/queries";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function AdminCustomersPage() {
  const customers = await listAdminCustomers();

  return (
    <main>
      <p className="kicker">People</p>
      <h1 className="page-title mt-1">Customers</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Accounts, spend, and referral activity.
      </p>

      <section className="card mt-8 overflow-hidden">
        {customers.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No customer accounts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Spent</th>
                  <th>Points</th>
                  <th>Referrals</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <span className="flex items-center gap-3">
                        <Avatar
                          name={customer.name}
                          url={customer.avatarUrl}
                          size={36}
                        />
                        <span className="min-w-0">
                          <span className="block font-semibold text-primary">
                            {customer.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {customer.email}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td>{customer.orderCount}</td>
                    <td className="font-medium">{formatPrice(customer.spent)}</td>
                    <td>{customer.points}</td>
                    <td>{customer.referralCount}</td>
                    <td className="text-muted-foreground">{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
