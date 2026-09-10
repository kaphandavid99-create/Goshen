"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/money";
import type { CakeItem } from "@/types/cakes";

export function CakeGallery({
  items,
  whatsappNumber,
  businessName,
}: {
  items: CakeItem[];
  whatsappNumber: string;
  businessName: string;
}) {
  const { locale, t } = useI18n();

  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const item of items) {
      if (!seen.includes(item.category)) {
        seen.push(item.category);
      }
    }
    return seen;
  }, [items]);

  const [active, setActive] = useState<string>("All");

  const visible =
    active === "All" ? items : items.filter((item) => item.category === active);

  function priceLabel(item: CakeItem) {
    if (item.priceCents != null) {
      return `${item.priceNote ? `${item.priceNote} ` : ""}${formatPrice(
        item.priceCents,
        locale,
      )}`;
    }
    return item.priceNote || t.nipz.priceOnRequest;
  }

  function orderHref(item: CakeItem) {
    const label = `${item.name}${
      item.priceCents != null || item.priceNote ? ` — ${priceLabel(item)}` : ""
    }`;
    const text = t.nipz.orderMessage(businessName, label);
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }

  if (items.length === 0) {
    return (
      <p className="card p-6 text-sm text-muted-foreground">
        {t.nipz.galleryEmpty}
      </p>
    );
  }

  return (
    <div>
      {categories.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={
                active === category ? "nipz-filter is-active" : "nipz-filter"
              }
            >
              {category === "All" ? t.nipz.all : category}
            </button>
          ))}
        </div>
      ) : null}

      <div className="nipz-gallery mt-6">
        {visible.map((item) => (
          <article key={item.id} className="nipz-cake-card">
            <div className="nipz-cake-media">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(min-width: 960px) 30vw, (min-width: 560px) 45vw, 90vw"
              />
              {item.featured ? (
                <span className="nipz-cake-badge">{t.nipz.signature}</span>
              ) : null}
            </div>
            <div className="nipz-cake-body">
              <p className="nipz-cake-cat">{item.category}</p>
              <h3 className="nipz-cake-name">{item.name}</h3>
              <p className="nipz-cake-desc">{item.description}</p>
              <div className="nipz-cake-foot">
                <span className="nipz-cake-price">{priceLabel(item)}</span>
                <a
                  href={orderHref(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-rose px-3.5 py-2 text-xs"
                >
                  {t.nipz.orderOnWhatsapp}
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
