import Image from "next/image";

type ThumbItem = {
  id: string;
  name: string;
  quantity: number;
  imageUrl: string | null;
  product?: { images: { url: string }[] } | null;
};

export function orderItemImage(item: ThumbItem) {
  return item.imageUrl ?? item.product?.images[0]?.url ?? null;
}

/** Full "2× Cocktail Mix, 1× Garri (5kg), …" listing — for a hover tooltip
 * so every product in the order is readable, not just the first few thumbs. */
function fullItemList(items: ThumbItem[]) {
  return items.map((item) => `${item.quantity}× ${item.name}`).join(", ");
}

/** A small stacked preview of the products in an order, for admin tables.
 * Only the first few get a thumbnail (table rows have limited width), but
 * every product's name is always in the group's tooltip — hover the row to
 * read the full list without opening the order. */
export function OrderThumbs({ items }: { items: ThumbItem[] }) {
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const shown = items.slice(0, 4);
  const extra = items.length - shown.length;
  const fullList = fullItemList(items);

  return (
    <span className="flex items-center gap-2" title={fullList}>
      <span className="flex -space-x-2">
        {shown.map((item) => {
          const url = orderItemImage(item);
          return (
            <span
              key={item.id}
              className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-card bg-muted ring-1 ring-border"
            >
              {url ? (
                <Image
                  src={url}
                  alt={item.name}
                  fill
                  sizes="36px"
                  className="object-contain p-0.5"
                />
              ) : (
                <span className="absolute inset-0 grid place-items-center text-[8px] font-semibold text-muted-foreground">
                  {item.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </span>
          );
        })}
        {extra > 0 ? (
          <span className="relative grid size-9 shrink-0 place-items-center rounded-lg border border-card bg-muted text-[10px] font-semibold text-muted-foreground ring-1 ring-border">
            +{extra}
          </span>
        ) : null}
      </span>
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {items.length} item{items.length === 1 ? "" : "s"} · {totalUnits} pcs
      </span>
    </span>
  );
}
