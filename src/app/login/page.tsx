import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { PageIntro } from "@/components/layout/page-intro";
import { getDict } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.login };
}

export default async function LoginPage() {
  const t = await getDict();

  return (
    <main className="page-wrap flex flex-1 items-center justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <PageIntro kicker={t.auth.kicker} title={t.auth.signInTitle}>
          {t.auth.signInIntro}
        </PageIntro>
        <div className="mt-8">
          <Suspense>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
