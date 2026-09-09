import type { Metadata } from "next";
import { HeroImageManager, HeroTextForm } from "@/components/admin/hero-editor";
import { isCloudinaryConfigured } from "@/lib/env";
import { getHeroContent } from "@/server/site/hero";

export const metadata: Metadata = {
  title: "Homepage hero",
};

export default async function AdminHeroPage() {
  const content = await getHeroContent();
  const configured = isCloudinaryConfigured();

  return (
    <main>
      <p className="kicker">Homepage</p>
      <h1 className="page-title mt-1">Hero</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        The headline, rotating lines, buttons, and images at the top of the
        homepage.
      </p>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="section-title">Text</h2>
        <div className="mt-5">
          <HeroTextForm content={content} />
        </div>
      </section>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="section-title">Images</h2>
        <div className="mt-5">
          <HeroImageManager images={content.images} configured={configured} />
        </div>
      </section>
    </main>
  );
}
