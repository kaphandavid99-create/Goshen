"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { DRINK_FLAVORS, DRINKS_CATEGORY_SLUG } from "@/lib/constants";

const IMAGE_TYPES = "image/jpeg,image/png,image/webp";

type CategoryOption = { id: string; name: string; slug: string };
type SimpleProductOption = { id: string; name: string; unit: string };
type BundleItemValue = { productId: string; quantity: number };

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
  kind: "SIMPLE" | "BUNDLE";
  bundleItems: BundleItemValue[];
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
  kind: "SIMPLE",
  bundleItems: [],
};

type StagedImage = { file: File; url: string };

export function ProductForm({
  categories,
  allProducts = [],
  bundlesCategoryId,
  cloudinaryConfigured = false,
  productId,
  initial,
}: {
  categories: CategoryOption[];
  allProducts?: SimpleProductOption[];
  bundlesCategoryId?: string;
  cloudinaryConfigured?: boolean;
  productId?: string;
  initial?: ProductValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(productId);
  const [values, setValues] = useState<ProductValues>(initial ?? EMPTY);
  const [images, setImages] = useState<StagedImage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // Release any still-staged object URLs when the form unmounts.
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  function addImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((current) => [...current, ...next]);
  }

  function removeImage(url: string) {
    setImages((current) => {
      const target = current.find((image) => image.url === url);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((image) => image.url !== url);
    });
  }

  function set<K extends keyof ProductValues>(key: K, value: ProductValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const isBundle = values.kind === "BUNDLE";

  const isDrinkCategory =
    !isBundle &&
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

  function chooseKind(kind: "SIMPLE" | "BUNDLE") {
    setValues((current) => ({
      ...current,
      kind,
      categoryId:
        kind === "BUNDLE"
          ? (bundlesCategoryId ?? current.categoryId)
          : current.categoryId,
      unit:
        kind === "BUNDLE" && !current.unit.trim() ? "bundle" : current.unit,
    }));
  }

  const usedIds = new Set(values.bundleItems.map((item) => item.productId));
  const available = allProducts.filter((product) => !usedIds.has(product.id));

  function addBundleItem(productId: string) {
    if (!productId) return;
    setValues((current) =>
      current.bundleItems.some((item) => item.productId === productId)
        ? current
        : {
            ...current,
            bundleItems: [...current.bundleItems, { productId, quantity: 1 }],
          },
    );
  }

  function setBundleQuantity(productId: string, quantity: number) {
    setValues((current) => ({
      ...current,
      bundleItems: current.bundleItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity || 1) }
          : item,
      ),
    }));
  }

  function removeBundleItem(productId: string) {
    setValues((current) => ({
      ...current,
      bundleItems: current.bundleItems.filter(
        (item) => item.productId !== productId,
      ),
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNote(null);

    if (isBundle && values.bundleItems.length < 2) {
      setError("A bundle needs at least two products.");
      setPending(false);
      return;
    }

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
              !isBundle &&
              values.wholesalePriceCents &&
              values.wholesalePriceCents > 0
                ? Number(values.wholesalePriceCents)
                : null,
            // Flavours only apply to drinks.
            flavors: isDrinkCategory ? values.flavors : [],
            bundleItems: isBundle
              ? values.bundleItems.map((item) => ({
                  productId: item.productId,
                  quantity: Number(item.quantity) || 1,
                }))
              : undefined,
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
        return;
      }

      if (!data.product) {
        return;
      }
      const newId = data.product.id;

      // New product created — now push the photos that were staged first.
      let failed = 0;
      if (images.length > 0) {
        setNote(
          `Uploading ${images.length} photo${images.length === 1 ? "" : "s"}…`,
        );
        const csrf = await readCsrf();
        for (const image of images) {
          const body = new FormData();
          body.append("file", image.file);
          body.append("alt", values.name);
          const upload = await fetch(`/api/admin/products/${newId}/media`, {
            method: "POST",
            credentials: "same-origin",
            headers: { "x-csrf-token": csrf },
            body,
          }).catch(() => null);
          if (!upload || !upload.ok) failed += 1;
        }
        images.forEach((image) => URL.revokeObjectURL(image.url));
      }

      if (failed > 0) {
        setError(
          `Product created, but ${failed} photo${failed === 1 ? "" : "s"} failed to upload. Add them on the next screen.`,
        );
        window.setTimeout(() => router.push(`/admin/products/${newId}`), 1500);
        return;
      }

      router.push(`/admin/products/${newId}`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  const productName = (id: string) =>
    allProducts.find((product) => product.id === id)?.name ?? "Removed product";
  const productUnit = (id: string) =>
    allProducts.find((product) => product.id === id)?.unit ?? "";

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      {!isEdit ? (
        <fieldset className="space-y-3 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium">Photos</legend>
          {cloudinaryConfigured ? (
            <>
              <p className="text-xs text-muted-foreground">
                Add the product photos first. They upload to Cloudinary (with the
                background removed) when you create the product. You can add more
                later.
              </p>
              {images.length > 0 ? (
                <ul className="flex flex-wrap gap-3">
                  {images.map((image) => (
                    <li
                      key={image.url}
                      className="relative size-20 overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                        unoptimized
                      />
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onClick={() => removeImage(image.url)}
                        className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-card text-xs shadow"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:border-primary">
                <span>{images.length > 0 ? "Add more photos" : "Choose photos"}</span>
                <input
                  type="file"
                  accept={IMAGE_TYPES}
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    addImages(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            </>
          ) : (
            <p className="text-xs text-accent">
              Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and
              CLOUDINARY_API_SECRET to .env to upload photos. You can still create
              the product now and add photos once it&apos;s configured.
            </p>
          )}
        </fieldset>
      ) : null}

      {!isEdit ? (
        <fieldset className="space-y-2 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium">Product type</legend>
          <div className="flex flex-wrap gap-4 pt-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="kind"
                checked={!isBundle}
                onChange={() => chooseKind("SIMPLE")}
              />
              <span>Simple product</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="kind"
                checked={isBundle}
                onChange={() => chooseKind("BUNDLE")}
              />
              <span>Bundle (a set of products at one price)</span>
            </label>
          </div>
        </fieldset>
      ) : (
        <p className="text-sm text-muted-foreground">
          Type: <span className="font-medium text-primary">
            {isBundle ? "Bundle" : "Simple product"}
          </span>
        </p>
      )}

      <label className="block space-y-2 text-sm">
        <span className="font-medium">
          {isBundle ? "Bundle name" : "Product name"}
        </span>
        <input
          className="field"
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          required
          maxLength={120}
          placeholder={
            isBundle ? "e.g. Kitchen Starter Bundle" : "e.g. Peak Powdered Milk"
          }
        />
      </label>

      {!isBundle ? (
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
      ) : null}

      <div className={`grid gap-4 ${isBundle ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">
            {isBundle ? "Bundle price (FCFA)" : "Retail price (FCFA)"}
          </span>
          <input
            className="field"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={values.priceCents ? String(values.priceCents) : ""}
            onChange={(event) => set("priceCents", Number(event.target.value))}
            required
            placeholder={isBundle ? "5000" : "1500"}
          />
        </label>
        {!isBundle ? (
          <label className="block space-y-2 text-sm">
            <span className="font-medium">
              Wholesale price{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <input
              className="field"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={
                values.wholesalePriceCents
                  ? String(values.wholesalePriceCents)
                  : ""
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
        ) : null}
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Unit</span>
          <input
            className="field"
            value={values.unit}
            onChange={(event) => set("unit", event.target.value)}
            required
            maxLength={40}
            placeholder={isBundle ? "bundle" : "500g, 1L, pack of 6"}
          />
        </label>
      </div>
      {!isBundle ? (
        <p className="-mt-1 text-xs text-muted-foreground">
          Set a wholesale price to sell this product to approved business buyers
          on <span className="font-medium">/wholesale</span>. Leave it blank for
          retail-only.
        </p>
      ) : null}

      {isBundle ? (
        <fieldset className="space-y-3 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium">
            Products in this bundle
          </legend>
          <p className="text-xs text-muted-foreground">
            Add the products a customer gets, and how many of each. The bundle
            sells at the one price above and goes out of stock automatically when
            any product inside runs out.
          </p>

          {values.bundleItems.length > 0 ? (
            <ul className="space-y-2">
              {values.bundleItems.map((item) => (
                <li
                  key={item.productId}
                  className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-primary">
                    {productName(item.productId)}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {productUnit(item.productId)}
                    </span>
                  </span>
                  <label className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Qty</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={item.quantity}
                      onChange={(event) =>
                        setBundleQuantity(
                          item.productId,
                          Number(event.target.value),
                        )
                      }
                      className="field w-16 py-1"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeBundleItem(item.productId)}
                    className="text-sm underline underline-offset-4"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No products added yet.
            </p>
          )}

          <label className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">Add a product</span>
            <select
              className="field w-auto min-w-56"
              value=""
              onChange={(event) => {
                addBundleItem(event.target.value);
                event.target.value = "";
              }}
              disabled={available.length === 0}
            >
              <option value="">
                {available.length === 0
                  ? "All products added"
                  : "Choose a product…"}
              </option>
              {available.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · {product.unit}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      ) : null}

      <label className="block space-y-2 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          className="field min-h-28"
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
          required
          maxLength={2000}
          placeholder={
            isBundle
              ? "What the bundle is for and who it suits."
              : "What it is, size, and anything a shopper should know."
          }
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
        {!isBundle ? (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(event) => set("featured", event.target.checked)}
            />
            <span className="font-medium">Featured deal</span>
          </label>
        ) : null}
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
              : isBundle
                ? "Create bundle"
                : "Create product"}
        </button>
        {!isEdit ? (
          <span className="text-sm text-muted-foreground">
            {images.length > 0
              ? `${images.length} photo${images.length === 1 ? "" : "s"} will upload with it.`
              : "You can add photos above or on the next screen."}
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
