"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { DRINK_FLAVORS, DRINKS_CATEGORY_SLUG } from "@/lib/constants";

type CategoryOption = { id: string; name: string; slug: string };

type ProductValues = {
  name: string;
  description: string;
  priceCents: number;
  wholesalePriceCents: number | null;
  unit: string;
  categoryId: string;
  inStock: boolean;
  featured: boolean;
  flavors: string[];
};

const EMPTY: ProductValues = {
  name: "",
  description: "",
  priceCents: 0,
  wholesalePriceCents: null,
  unit: "",
  categoryId: "",
  inStock: true,
  featured: false,
  flavors: [],
};

export function ProductForm({
  categories,
  productId,
  initial,
}: {
  categories: CategoryOption[];
  productId?: string;
  initial?: ProductValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(productId);
  const [values, setValues] = useState<ProductValues>(initial ?? EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function set<K extends keyof ProductValues>(key: K, value: ProductValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const isDrinkCategory =
    categories.find((category) => category.id === values.categoryId)?.slug ===
    DRINKS_CATEGORY_SLUG;

  function toggleFlavor(flavor: string) {
    setValues((current) => ({
      ...current,
      flavors: current.flavors.includes(flavor)
        ? current.flavors.filter((entry) => entry !== flavor)
        : [...current.flavors, flavor],
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNote(null);

    try {
      const response = await fetch(
        isEdit ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": await readCsrf(),
          },
          body: JSON.stringify({
            ...values,
            priceCents: Number(values.priceCents) || 0,
            wholesalePriceCents:
              values.wholesalePriceCents && values.wholesalePriceCents > 0
                ? Number(values.wholesalePriceCents)
                : null,
            // Flavours only apply to drinks.
            flavors: isDrinkCategory ? values.flavors : [],
          }),
        },
      );
      const data = (await response.json()) as {
        error?: string;
        product?: { id: string };
      };

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (isEdit) {
        setNote("Saved.");
        router.refresh();
      } else if (data.product) {
        router.push(`/admin/products/${data.product.id}`);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      <label className="block space-y-2 text-sm">
        <span className="font-medium">Product name</span>
        <input
          className="field"
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          required
          maxLength={120}
          placeholder="e.g. Peak Powdered Milk"
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="font-medium">Category</span>
        <select
          className="field"
          value={values.categoryId}
          onChange={(event) => set("categoryId", event.target.value)}
          required
        >
          <option value="" disabled>
            Choose a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Retail price (FCFA)</span>
          <input
            className="field"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={values.priceCents ? String(values.priceCents) : ""}
            onChange={(event) => set("priceCents", Number(event.target.value))}
            required
            placeholder="1500"
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">
            Wholesale price{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <input
            className="field"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={
              values.wholesalePriceCents ? String(values.wholesalePriceCents) : ""
            }
            onChange={(event) =>
              set(
                "wholesalePriceCents",
                event.target.value ? Number(event.target.value) : null,
              )
            }
            placeholder="1300"
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Unit</span>
          <input
            className="field"
            value={values.unit}
            onChange={(event) => set("unit", event.target.value)}
            required
            maxLength={40}
            placeholder="500g, 1L, pack of 6"
          />
        </label>
      </div>
      <p className="-mt-1 text-xs text-muted-foreground">
        Set a wholesale price to sell this product to approved business buyers on{" "}
        <span className="font-medium">/wholesale</span>. Leave it blank for
        retail-only.
      </p>

      <label className="block space-y-2 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          className="field min-h-28"
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
          required
          maxLength={2000}
          placeholder="What it is, size, and anything a shopper should know."
        />
      </label>

      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.inStock}
            onChange={(event) => set("inStock", event.target.checked)}
          />
          <span className="font-medium">In stock</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(event) => set("featured", event.target.checked)}
          />
          <span className="font-medium">Featured deal</span>
        </label>
      </div>

      {isDrinkCategory ? (
        <fieldset className="space-y-2 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium">
            Available flavours
          </legend>
          <p className="text-xs text-muted-foreground">
            Tick the flavours a shopper can choose for this drink. Leave all
            unticked to sell it without a flavour choice.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3">
            {DRINK_FLAVORS.map((flavor) => (
              <label key={flavor} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.flavors.includes(flavor)}
                  onChange={() => toggleFlavor(flavor)}
                />
                <span>{flavor}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending
            ? "Saving…"
            : isEdit
              ? "Save details"
              : "Create product"}
        </button>
        {!isEdit ? (
          <span className="text-sm text-muted-foreground">
            You&apos;ll add photos on the next screen.
          </span>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
    </form>
  );
}

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not delete this product.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void remove()}
            disabled={pending}
            className="btn btn-primary"
          >
            {pending ? "Deleting…" : `Delete "${productName}"`}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn btn-outline"
        >
          Delete product
        </button>
      )}
      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
