import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  unit: string;
  imageUrl?: string;
  quantity: number;
  /**
   * Drink lines only: { "Orange": 6, "Cocktail": 3 }. When present, `quantity`
   * is kept in sync with the sum of these values.
   */
  flavors?: Record<string, number>;
};

function flavorsTotal(flavors: Record<string, number>) {
  return Object.values(flavors).reduce((sum, qty) => sum + qty, 0);
}

function mergeFlavors(
  base: Record<string, number> | undefined,
  extra: Record<string, number>,
) {
  const merged: Record<string, number> = { ...(base ?? {}) };
  for (const [name, qty] of Object.entries(extra)) {
    merged[name] = (merged[name] ?? 0) + qty;
  }
  return merged;
}

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setFlavorQuantity: (
    productId: string,
    flavor: string,
    quantity: number,
  ) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem(item, quantity = 1) {
        set((state) => {
          const existing = state.items.find(
            (entry) => entry.productId === item.productId,
          );

          // Drink lines carry a flavour breakdown; the line quantity follows it.
          if (item.flavors) {
            const addition = item.flavors;
            if (flavorsTotal(addition) < 1) return state;

            if (existing) {
              return {
                items: state.items.map((entry) => {
                  if (entry.productId !== item.productId) return entry;
                  const flavors = mergeFlavors(entry.flavors, addition);
                  return { ...entry, flavors, quantity: flavorsTotal(flavors) };
                }),
              };
            }

            return {
              items: [
                ...state.items,
                { ...item, flavors: addition, quantity: flavorsTotal(addition) },
              ],
            };
          }

          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.productId === item.productId
                  ? { ...entry, quantity: entry.quantity + quantity }
                  : entry,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity }],
          };
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
      setFlavorQuantity(productId, flavor, quantity) {
        set((state) => {
          const next: CartItem[] = [];
          for (const item of state.items) {
            if (item.productId !== productId || !item.flavors) {
              next.push(item);
              continue;
            }
            const flavors = { ...item.flavors };
            if (quantity < 1) {
              delete flavors[flavor];
            } else {
              flavors[flavor] = quantity;
            }
            const total = flavorsTotal(flavors);
            if (total < 1) continue; // drop the line when nothing is left
            next.push({ ...item, flavors, quantity: total });
          }
          return { items: next };
        });
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
      name: "goshen-cart",
    },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotalCents(items: CartItem[]) {
  return items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
}
