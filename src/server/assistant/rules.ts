import "server-only";

import { STORE } from "@/lib/constants";
import { formatPrice } from "@/lib/money";
import { runTool, type ToolContext } from "@/server/assistant/tools";

export type RuleAnswer = {
  text: string;
  toolTrace: { name: string; input: unknown }[];
};

const WHATSAPP = `[WhatsApp](${STORE.whatsappHref})`;
const ORDER_NUMBER = /\b(GO[SW]-\d{6,8}-\d{3,4})\b/i;

const PRICE_CAP =
  /(?:under|below|less than|cheaper than|no more than|max(?:imum)?|up to|at most)\s*(?:fcfa|frs?\.?|xaf)?\s*([\d][\d,\s]*)/i;

/**
 * Deterministic first pass. Returns an answer when it is confident, or `null` to
 * let the caller fall back (to Gemini if configured, otherwise a generic reply).
 */
export async function answerWithRules(
  message: string,
  ctx: ToolContext,
): Promise<RuleAnswer | null> {
  const raw = message.trim();
  const text = raw.toLowerCase();
  const hit = (...words: string[]) => words.some((w) => text.includes(w));

  // --- small talk ---------------------------------------------------------
  if (
    /^\s*(hi|hello|hey|yo|hiya|howdy|greetings|good\s+(morning|afternoon|evening))\b[\s!.,]*$/i.test(raw) ||
    /\b(how are you|how('?s| is) it going|how far|how you dey|wetin dey happen)\b/i.test(text)
  ) {
    return {
      toolTrace: [],
      text: "Hi! I'm doing well, thanks. I can help you find products, check an order, or use your loyalty points. What are you looking for?",
    };
  }
  if (/^\s*(thanks|thank you|thx|merci|much appreciated)\b[\s!.,]*$/i.test(raw)) {
    return { toolTrace: [], text: "You're welcome! Anything else I can help with?" };
  }

  // --- a specific order number ------------------------------------------
  const orderMatch = ORDER_NUMBER.exec(raw);
  if (orderMatch) {
    const input = { orderNumber: orderMatch[1].toUpperCase() };
    const result = await run("get_order_details", input, ctx);
    return { toolTrace: [{ name: "get_order_details", input }], text: formatOrder(result) };
  }

  // --- my orders --------------------------------------------------------
  if (
    (hit("order", "orders", "delivery") &&
      hit("my ", "where", "track", "status", "list", "recent", "last")) ||
    /\b(my orders|track my order|order status|where('?s| is) my)\b/i.test(text)
  ) {
    const result = await run("get_my_orders", {}, ctx);
    return { toolTrace: [{ name: "get_my_orders", input: {} }], text: formatOrders(result) };
  }

  // --- loyalty points --------------------------------------------------
  if (hit("point", "points", "loyalty", "reward", "rewards")) {
    const result = await run("get_loyalty_status", {}, ctx);
    return {
      toolTrace: [{ name: "get_loyalty_status", input: {} }],
      text: formatLoyalty(result),
    };
  }

  // --- canned help topics --------------------------------------------
  const topic = matchTopic(text);
  if (topic) {
    const result = await run("get_help_topic", { topic }, ctx);
    const answer = (result as { answer?: string }).answer;
    if (answer) return { toolTrace: [{ name: "get_help_topic", input: { topic } }], text: answer };
  }

  // --- "what do you sell" -> categories ------------------------------
  if (/\b(what do you (sell|have|stock)|your categories|what('?s| is) available|browse)\b/i.test(text)) {
    const result = await run("list_categories", {}, ctx);
    const categories = (result as { categories?: { name: string; url: string }[] }).categories ?? [];
    if (categories.length) {
      return {
        toolTrace: [{ name: "list_categories", input: {} }],
        text:
          "Here are the shop categories:\n" +
          categories.map((c) => `- [${c.name}](${c.url})`).join("\n"),
      };
    }
  }

  // --- product search ------------------------------------------------
  const search = buildProductSearch(text);
  if (search) {
    const { terms, ...filters } = search;
    const searchTerms = (terms.length ? terms : [""]).slice(0, 3);

    const seen = new Set<string>();
    const merged: unknown[] = [];
    const toolTrace: { name: string; input: unknown }[] = [];

    for (const term of searchTerms) {
      const input = { query: term, ...filters };
      toolTrace.push({ name: "search_products", input });
      const result = (await run("search_products", input, ctx)) as {
        products?: { slug: string }[];
      };
      for (const product of result.products ?? []) {
        if (seen.has(product.slug)) continue;
        seen.add(product.slug);
        merged.push(product);
      }
    }

    const shown = merged.slice(0, 10);
    return {
      toolTrace,
      text: formatProducts({ products: shown, count: merged.length }, terms.join(", ")),
    };
  }

  return null;
}

/** Generic reply when nothing matched and Gemini is not available. */
export function genericFallback(): string {
  return (
    "I can help with finding products, checking your orders, loyalty points, delivery, opening hours, wholesale and cakes. " +
    `Try asking one of those. For anything else, message the shop on ${WHATSAPP} or call ${STORE.phoneDisplay}.`
  );
}

// --------------------------------------------------------------------------

async function run(name: string, input: unknown, ctx: ToolContext) {
  return runTool(name, input, ctx);
}

function matchTopic(text: string):
  | "delivery"
  | "payment"
  | "wholesale"
  | "cakes"
  | "rewards"
  | "returns"
  | "hours_location"
  | "account"
  | "contact"
  | null {
  if (has(text, "deliver", "delivery", "shipping", "bring it", "drop off")) return "delivery";
  if (has(text, "pay ", "payment", "mobile money", "momo", "orange money", "mtn money", "cash on"))
    return "payment";
  if (has(text, "wholesale", "bulk", "in bulk", "reseller", "business account", "distributor"))
    return "wholesale";
  if (has(text, "cake", "cakes", "pastry", "pastries", "cupcake", "nipz", "dessert table"))
    return "cakes";
  if (has(text, "return", "refund", "complain", "complaint", "damaged", "wrong item", "broken", "expired"))
    return "returns";
  if (has(text, "open", "opening", "hours", "location", "address", "directions", "where are you", "find you"))
    return "hours_location";
  if (has(text, "my account", "profile", "wishlist", "notification", "saved address"))
    return "account";
  if (has(text, "contact", "phone number", "call you", "whatsapp", "reach you", "talk to someone"))
    return "contact";
  return null;
}

function has(text: string, ...words: string[]) {
  return words.some((w) => text.includes(w));
}

const SEARCH_TRIGGER =
  /\b(do you (have|sell|stock|carry)|got any|have any|looking for|search for|find me|i need|i want|need some|price (of|for)|how much (is|are|for|does)|cost of|selling|buy|is there any|any\b)\b/i;

const STRIP =
  /\b(do you|have|sell|stock|carry|carrying|got|any|some|looking for|search for|find me|find|show me|show|please|i need|i want|i'?m looking for|need|want|the|a|an|is there|are there|price|prices|of|for|how much|how many|is|are|was|does|do|cost|costs|selling|buy|get|in stock|available|availability|on offer|on sale|offer|offers|sale|deal|deals|discount|discounted|what|what'?s|whats|you|your|there|here|today|now|guys|shop|store|goshen|me|us|it|this|that|to|how|hey|hi|hello|well|just|please|kindly|still)\b/gi;

const JUNK_QUERY = new Set([
  "", "you", "there", "it", "this", "that", "one", "some", "thing", "things",
  "stuff", "product", "products", "item", "items", "how", "hey", "well", "ok",
  "okay", "yes", "no", "nah", "yeah", "hmm",
]);

function buildProductSearch(text: string):
  | { terms: string[]; maxPriceFcfa?: number; inStockOnly?: boolean; dealsOnly?: boolean }
  | null {
  const looksLikeQuestion = SEARCH_TRIGGER.test(text);
  const short = text.replace(/[?.!]/g, "").trim().split(/\s+/).length <= 5;

  if (!looksLikeQuestion && !short) return null;

  const priceMatch = PRICE_CAP.exec(text);
  const maxPriceFcfa = priceMatch
    ? Number(priceMatch[1].replace(/[,\s]/g, ""))
    : undefined;

  const cleaned = text
    .replace(PRICE_CAP, " ")
    .replace(/[?.!]/g, " ")
    .replace(STRIP, " ")
    .replace(/\b(fcfa|frs?\.?|xaf)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const terms = cleaned
    .split(/\s*(?:,|\bor\b|\band\b|\+|\/)\s*/i)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !JUNK_QUERY.has(t));

  const inStockOnly =
    /\b(in stock|available|do you have (it|any))\b/i.test(text) || undefined;
  const dealsOnly =
    /\b(on offer|on sale|offers?|deal|deals|discount|discounted|cheapest|best price)\b/i.test(
      text,
    ) || undefined;

  if (!terms.length && !dealsOnly) return null;

  return {
    terms,
    ...(maxPriceFcfa && Number.isFinite(maxPriceFcfa) ? { maxPriceFcfa } : {}),
    ...(inStockOnly ? { inStockOnly: true } : {}),
    ...(dealsOnly ? { dealsOnly: true } : {}),
  };
}

// --- formatters ---------------------------------------------------------

type Unknown = Record<string, unknown>;

function formatProducts(result: unknown, query: string): string {
  const data = result as {
    products?: {
      name: string;
      url: string;
      priceFcfa: number;
      unit: string;
      inStock: boolean;
      onOffer: boolean;
    }[];
    count?: number;
  };
  const products = data.products ?? [];

  if (!products.length) {
    if (!query) {
      return "I don't see anything matching that right now. Browse everything at [the shop](/shop).";
    }
    return (
      `I couldn't find anything matching "${query}". ` +
      "Browse everything at [the shop](/shop), or ask the shop directly on " +
      `${WHATSAPP}.`
    );
  }

  const lines = products.map((p) => {
    const price = `${formatPrice(p.priceFcfa)} / ${p.unit}`;
    const flags = [
      p.onOffer ? "on offer" : null,
      p.inStock ? null : "out of stock",
    ]
      .filter(Boolean)
      .join(", ");
    return `- [${p.name}](${p.url}) — ${price}${flags ? ` (${flags})` : ""}`;
  });

  const more =
    (data.count ?? products.length) > products.length
      ? `\n\nMore at [the shop](/shop).`
      : "";

  return `Here's what I found:\n${lines.join("\n")}${more}`;
}

function formatOrders(result: unknown): string {
  const data = result as {
    needsAuth?: boolean;
    loginUrl?: string;
    orders?: {
      orderNumber: string;
      status: string;
      placedAt: string;
      totalFcfa: number;
      url: string;
    }[];
  };

  if (data.needsAuth) {
    return `You'll need to [sign in](${data.loginUrl}) to see your orders.`;
  }

  const orders = data.orders ?? [];
  if (!orders.length) {
    return "You don't have any orders yet. Start at [the shop](/shop).";
  }

  const lines = orders.map(
    (o) =>
      `- [${o.orderNumber}](${o.url}) — **${o.status}**, ${formatPrice(o.totalFcfa)}, placed ${o.placedAt}`,
  );
  return `Your recent orders:\n${lines.join("\n")}\n\nOpen one for the full details.`;
}

function formatOrder(result: unknown): string {
  const o = result as Unknown & {
    needsAuth?: boolean;
    loginUrl?: string;
    found?: boolean;
    ordersUrl?: string;
    orderNumber?: string;
    status?: string;
    statusMeaning?: string;
    fulfillment?: string;
    items?: { name: string; quantity: number; flavors?: string }[];
    totalFcfa?: number;
    url?: string;
  };

  if (o.needsAuth) return `Please [sign in](${o.loginUrl}) to check that order.`;
  if (o.found === false) {
    return "I couldn't find that order on your account. See [all your orders](/account/orders).";
  }

  const items = (o.items ?? [])
    .map((it) =>
      it.flavors
        ? `${it.quantity}× ${it.name} (${it.flavors})`
        : `${it.quantity}× ${it.name}`,
    )
    .join(", ");

  return (
    `**${o.orderNumber}** — ${o.status}. ${o.statusMeaning ?? ""}\n` +
    `${o.fulfillment === "DELIVERY" ? "Delivery" : "Pickup"} · ${items || "no items listed"}\n` +
    `Total ${formatPrice(o.totalFcfa ?? 0)}. [Open the order](${o.url})`
  );
}

function formatLoyalty(result: unknown): string {
  const d = result as {
    needsAuth?: boolean;
    loginUrl?: string;
    points?: number;
    redeem?: { minPoints: number; minOrderFcfa: number; canRedeemNow: boolean };
    earn?: { perHundredFcfa: number; referralBonus: number };
    referral?: { code?: string | null; url?: string };
  };

  if (d.needsAuth) {
    return `[Sign in](${d.loginUrl}) and I can show your points balance.`;
  }

  const points = d.points ?? 0;
  const redeem = d.redeem;
  const canNow = redeem?.canRedeemNow;

  const lines = [
    `You have **${points.toLocaleString("en-US")} points** (1 point = 1 FCFA off).`,
    redeem
      ? canNow
        ? `You can redeem now on orders of ${formatPrice(redeem.minOrderFcfa)} or more.`
        : `You can redeem once you reach ${redeem.minPoints} points, on orders of ${formatPrice(redeem.minOrderFcfa)} or more.`
      : null,
    d.earn
      ? `You earn ${d.earn.perHundredFcfa} ${d.earn.perHundredFcfa === 1 ? "point" : "points"} per 100 FCFA spent.`
      : null,
    d.referral?.code && d.earn
      ? `Share your referral link for ${d.earn.referralBonus} points per friend: [${d.referral.url}](${d.referral.url})`
      : null,
    `Full details at [rewards](/rewards).`,
  ].filter(Boolean);

  return lines.join("\n");
}
