import type { Metadata } from "next";
import { WholesaleApplicationActions } from "@/components/admin/wholesale-application-actions";
import { formatDate } from "@/lib/dates";
import { listWholesaleApplications } from "@/server/admin/queries";

export const metadata: Metadata = {
  title: "Wholesale",
};

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "APPROVED"
      ? "bg-primary text-primary-foreground"
      : status === "REJECTED"
        ? "bg-muted text-muted-foreground"
        : "bg-accent text-accent-foreground";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}
    >
      {status}
    </span>
  );
}

export default async function AdminWholesalePage() {
  const applications = await listWholesaleApplications();

  return (
    <main>
      <p className="kicker">People</p>
      <h1 className="page-title mt-1">Wholesale accounts</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Approve business buyers so they can see wholesale pricing and order in
        bulk. Set price breaks on each product in Products.
      </p>

      <section className="card mt-8 overflow-hidden">
        {applications.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No wholesale applications yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <p className="font-semibold text-primary">
                        {application.businessName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {application.location}
                      </p>
                      {application.note ? (
                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                          {application.note}
                        </p>
                      ) : null}
                    </td>
                    <td>
                      <p>{application.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {application.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {application.phone}
                      </p>
                    </td>
                    <td className="text-sm">{application.businessType}</td>
                    <td className="text-muted-foreground">
                      {formatDate(application.createdAt)}
                    </td>
                    <td>
                      <StatusPill status={application.status} />
                    </td>
                    <td>
                      <WholesaleApplicationActions
                        applicationId={application.id}
                        status={application.status}
                      />
                    </td>
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
