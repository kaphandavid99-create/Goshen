import { IconArrowRight, IconPin } from "@/components/icons";
import { APP_NAME, STORE } from "@/lib/constants";
import { getDict } from "@/lib/i18n/server";

export async function StoreMap({ className }: { className?: string }) {
  const t = await getDict();

  return (
    <section id="find-us" className={`card overflow-hidden ${className ?? ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-6 pb-4">
        <div>
          <p className="kicker">{t.storeMap.kicker}</p>
          <h2 className="section-title">{t.storeMap.title}</h2>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <IconPin className="mt-0.5 size-4 shrink-0 text-primary" />
            {STORE.location}
          </p>
        </div>
        <a
          href={STORE.directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          {t.storeMap.getDirections}
          <IconArrowRight className="size-4" />
        </a>
      </div>

      <div className="h-[320px] w-full border-t border-border bg-muted sm:h-[400px]">
        <iframe
          title={t.storeMap.mapTitle(APP_NAME, STORE.location)}
          src={STORE.mapEmbedSrc}
          className="h-full w-full"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <p className="px-6 py-4 text-xs text-muted-foreground">
        {t.storeMap.tapPre}{" "}
        <a
          href={STORE.mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2"
        >
          {t.storeMap.tapLink}
        </a>{" "}
        {t.storeMap.tapPost}
      </p>
    </section>
  );
}
