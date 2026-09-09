import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WholesaleCartItem = {
  productId: string;
  slug: string;
  name: string;
  unit: string;
  imageUrl?: string;
  /** Flat wholesale unit price in FCFA. */
  priceCents: number;
  quantity: number;
};

type WholesaleCartState = {
  items: WholesaleCartItem[];
  addItem: (
    item: Omit<WholesaleCartItem, "quantity">,
    quantity: number,
  ) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useWholesaleCartStore = create<WholesaleCartState>()(
  persist(
    (set) => ({
      items: [],
      addItem(item, quantity) {
        set((state) => {
          const existing = state.items.find(
            (entry) => entry.productId === item.productId,
          );

          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.productId === item.productId
                  ? { ...entry, ...item, quantity: entry.quantity + quantity }
                  : entry,
              ),
            };
          }

          return { items: [...state.items, { ...item, quantity }] };
        });
      },
      setQuantity(productId, quantity) {
        set((state) => ({
          items:
            quantity < 1
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item,
                ),
        }));
      },
      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      clear() {
        set({ items: [] });
      },
    }),
    {
      name: "goshen-wholesale-cart",
    },
  ),
);

export function wholesaleCartCount(items: WholesaleCartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function wholesaleCartSubtotalCents(items: WholesaleCartItem[]) {
  return items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  );
}
