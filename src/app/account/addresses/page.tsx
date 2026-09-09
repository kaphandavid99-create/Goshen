import type { Metadata } from "next";
import { AddressManager } from "@/components/account/address-manager";
import { getDict } from "@/lib/i18n/server";
import { getAccountProfile, listAddresses } from "@/server/account/hub";
import { requireUser } from "@/server/auth/current-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.account.nav.addresses };
}

export default async function AccountAddressesPage() {
  const user = await requireUser("/account/addresses");
  const [profile, addresses, t] = await Promise.all([
    getAccountProfile(user.id),
    listAddresses(user.id).catch(() => []),
    getDict(),
  ]);

  return (
    <section>
      <h2 className="section-title">{t.account.addresses.title}</h2>
      <p className="mt-2 mb-5 text-sm text-muted-foreground">
        {t.account.addresses.intro}
      </p>
      <AddressManager
        addresses={addresses}
        defaultName={profile?.name ?? user.name}
        defaultPhone={profile?.phone ?? ""}
      />
    </section>
  );
}
