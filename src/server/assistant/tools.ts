import "server-only";

import type { GroqTool } from "@/server/assistant/groq";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_FROM,
  MIN_REDEEM_POINTS,
  MIN_REDEEM_SUBTOTAL,
  POINTS_PER_100_FCFA,
  POINT_VALUE_FCFA,
  REFERRAL_POINTS,
  REVIEW_POINTS,
  STORE,
  WELCOME_POINTS,
  WHOLESALE_MIN_ORDER_CENTS,
} from "@/lib/constants";
import {
  formatFlavorSummary,
  normalizeFlavorQuantities,
} from "@/lib/flavors";
import { dealCompareAt } from "@/lib/money";
import { redeemableDiscount } from "@/lib/points";
import { orderStatusLabel } from "@/lib/order-status";
import {
  getProductBySlug,
  listCategories,
  listProducts,
} from "@/server/catalog/queries";
import { getCustomerDashboard } from "@/server/account/dashboard";
import { listOrdersForUser } from "@/server/orders/queries";

export type ToolContext = { userId: string | null };

const MAX_LIST = 8;

const STATUS_MEANING: Record<string, string> = {
  PENDING: "Waiting for the shop to confirm it.",
  CONFIRMED: "The shop confirmed it and is preparing it. You can mark it received once it reaches you.",
  RECEIVED: "You confirmed you received this order. Complete.",
  CANCELLED: "This order was cancelled.",
};

const HELP_TOPICS = {
  delivery: `Delivery costs ${DELIVERY_FEE.toLocaleString("en-US")} FCFA and is free on orders of ${FREE_DELIVERY_FROM.toLocaleString("en-US")} FCFA or more. Pickup at the shop is free. Choose delivery or pickup at [checkout](/checkout).`,
  payment: `Payment is arranged with the shop after you place the order (mobile money or cash). Place the order at [checkout](/checkout); the shop then confirms it.`,
  wholesale: `Approved business buyers get wholesale prices. See [/wholesale](/wholesale) and apply at [/wholesale/apply](/wholesale/apply). Minimum wholesale order is ${WHOLESALE_MIN_ORDER_CENTS.toLocaleString("en-US")} FCFA.`,
  cakes: `Custom cakes, cupcakes, pastries and dessert tables are from Nipz Pretty Cakes. Browse and request a booking at [/shop/nipz](/shop/nipz).`,
  rewards: `You earn ${POINTS_PER_100_FCFA} loyalty ${POINTS_PER_100_FCFA === 1 ? "point" : "points"} per 100 FCFA spent. Redeem from ${MIN_REDEEM_POINTS} points on orders of ${MIN_REDEEM_SUBTOTAL.toLocaleString("en-US")} FCFA or more, where ${POINT_VALUE_FCFA} point = 1 FCFA off. Full details at [/rewards](/rewards).`,
  returns: `For a problem with an order or an item, contact the shop on WhatsApp (${STORE.whatsappHref}) or call ${STORE.phoneDisplay}. Have your order number ready.`,
  hours_location: `Goshen is in ${STORE.location}, open ${STORE.hours} every day. Directions: ${STORE.directionsHref}`,
  account: `Manage your account at [/account](/account): [orders](/account/orders), [addresses](/account/addresses), [rewards](/account/rewards), [wishlist](/account/wishlist) and [notifications](/account/notifications).`,
  contact: `Reach the shop on WhatsApp (${STORE.whatsappHref}), by phone (${STORE.phoneDisplay}), or through the [contact page](/contact). Open ${STORE.hours} every day.`,
} as const;

type HelpTopic = keyof typeof HELP_TOPICS;

/** Wrap a bare JSON Schema in the OpenAI/Groq function-tool envelope. */
function tool(
  name: string,
  description: string,
  parameters: Record<string, unknown> = { type: "object", properties: {} },
): GroqTool {
  return { type: "function", function: { name, description, parameters } };
}

export const assistantTools: GroqTool[] = [
  tool(
    "search_products",
    "Search the Goshen catalogue. Use for questions like 'do you have rice', 'show me cooking oil under 2000', 'what's on offer'. Returns up to 8 products with links.",
    {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search, e.g. a product name or keyword." },
        categorySlug: { type: "string", description: "Restrict to one category slug (from list_categories)." },
        maxPriceFcfa: { type: "number", description: "Only products at or below this price in FCFA." },
        inStockOnly: { type: "boolean", description: "Only products currently in stock." },
        dealsOnly: { type: "boolean", description: "Only products that are on offer (featured deals)." },
      },
    },
  ),
  tool(
    "get_product_details",
    "Get the full details for one product by its slug (the last part of its /shop/<slug> URL).",
    { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
  ),
  tool("list_categories", "List the product categories in the shop, with links."),
  tool(
    "get_my_orders",
    "List the signed-in customer's recent orders with status and totals. Requires the customer to be signed in.",
  ),
  tool(
    "get_order_details",
    "Get one of the signed-in customer's orders by its order number (e.g. GOS-20260101-1234), including items and status. Requires sign in.",
    { type: "object", properties: { orderNumber: { type: "string" } }, required: ["orderNumber"] },
  ),
  tool(
    "get_loyalty_status",
    "Get the signed-in customer's loyalty points balance, what it is worth right now, how to earn more, and their referral link. Requires sign in.",
  ),
  tool(
    "get_help_topic",
    "Get the shop's standard explanation and page link for a common topic (delivery, payment, wholesale, cakes, rewards, returns, hours_location, account, contact).",
    {
      type: "object",
      properties: { topic: { type: "string", enum: Object.keys(HELP_TOPICS) } },
      required: ["topic"],
    },
  ),
];

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asBool(value: unknown) {
  return value === true;
}

function productSummary(product: {
  name: string;
  slug: string;
  priceCents: number;
  wholesalePriceCents?: number | null;
  unit: string;
  inStock: boolean;
  featured: boolean;
  category: { name: string };
  rating?: number | null;
}) {
  return {
    name: product.name,
    slug: product.slug,
    url: `/shop/${product.slug}`,
    priceFcfa: product.priceCents,
    wholesalePriceFcfa: product.wholesalePriceCents ?? null,
    onOffer: product.featured,
    // For featured deals the shop shows a struck-through "was" price (~20% higher).
    compareAtFcfa: dealCompareAt(product.priceCents, product.featured),
    unit: product.unit,
    inStock: product.inStock,
    category: product.category?.name ?? null,
    rating: product.rating ?? null,
  };
}

const needsAuth = (loginNext: string) => ({
  needsAuth: true,
  message: "Sign in to see this.",
  loginUrl: `/login?next=${encodeURIComponent(loginNext)}`,
});

export async function runTool(
  name: string,
  rawInput: unknown,
  ctx: ToolContext,
): Promise<unknown> {
  const input = (rawInput ?? {}) as Record<string, unknown>;

  try {
    switch (name) {
      case "search_products": {
        const query = asString(input.query);
        const categorySlug = asString(input.categorySlug);
        const maxPrice = asNumber(input.maxPriceFcfa);
        const inStockOnly = asBool(input.inStockOnly);
        const dealsOnly = asBool(input.dealsOnly);

        let products = await listProducts(categorySlug, query);
        if (maxPrice !== undefined) {
          products = products.filter((p) => p.priceCents <= maxPrice);
        }
        if (inStockOnly) {
          products = products.filter((p) => p.inStock);
        }
        if (dealsOnly) {
          products = products.filter((p) => p.featured);
        }

        return {
          count: products.length,
          products: products.slice(0, MAX_LIST).map(productSummary),
          shopUrl: "/shop",
        };
      }

      case "get_product_details": {
        const slug = asString(input.slug);
        if (!slug) return { error: "A product slug is required." };
        const product = await getProductBySlug(slug);
        if (!product) return { found: false, shopUrl: "/shop" };
        return {
          found: true,
          ...productSummary(product),
          description: product.description,
          images: (product as { images?: unknown[] }).images?.length ?? 0,
        };
      }

      case "list_categories": {
        const categories = await listCategories();
        return {
          categories: categories.map((c) => ({
            name: c.name,
            slug: c.slug,
            url: `/shop?category=${c.slug}`,
          })),
        };
      }

      case "get_my_orders": {
        if (!ctx.userId) return needsAuth("/account/orders");
        const orders = await listOrdersForUser(ctx.userId);
        return {
          count: orders.length,
          orders: orders.slice(0, 10).map((order) => ({
            orderNumber: order.orderNumber,
            status: orderStatusLabel(order.status),
            statusMeaning: STATUS_MEANING[order.status] ?? null,
            placedAt: order.createdAt.toISOString().slice(0, 10),
            totalFcfa: order.totalCents,
            itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
            fulfillment: order.fulfillment,
            url: `/account/orders/${order.id}`,
          })),
          ordersUrl: "/account/orders",
        };
      }

      case "get_order_details": {
        if (!ctx.userId) return needsAuth("/account/orders");
        const orderNumber = asString(input.orderNumber)?.toUpperCase();
        if (!orderNumber) return { error: "An order number is required." };
        const orders = await listOrdersForUser(ctx.userId);
        const order = orders.find(
          (o) => o.orderNumber.toUpperCase() === orderNumber,
        );
        if (!order) {
          return {
            found: false,
            message: "No order with that number on your account.",
            ordersUrl: "/account/orders",
          };
        }
        return {
          found: true,
          orderNumber: order.orderNumber,
          status: orderStatusLabel(order.status),
          statusMeaning: STATUS_MEANING[order.status] ?? null,
          placedAt: order.createdAt.toISOString(),
          confirmedAt: order.acceptedAt?.toISOString() ?? null,
          receivedAt: order.receivedAt?.toISOString() ?? null,
          fulfillment: order.fulfillment,
          deliveryAddress: order.address ?? null,
          items: order.items.map((item) => {
            const flavors = formatFlavorSummary(
              normalizeFlavorQuantities(item.flavors),
            );
            return {
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              priceFcfa: item.priceCents,
              ...(flavors ? { flavors } : {}),
            };
          }),
          subtotalFcfa: order.subtotalCents,
          deliveryFcfa: order.deliveryCents,
          discountFcfa: order.discountCents,
          pointsRedeemed: order.pointsRedeemed,
          totalFcfa: order.totalCents,
          url: `/account/orders/${order.id}`,
        };
      }

      case "get_loyalty_status": {
        if (!ctx.userId) return needsAuth("/account/rewards");
        const dashboard = await getCustomerDashboard(ctx.userId);
        const points = dashboard.stats.points;
        return {
          points,
          pointValueFcfa: POINT_VALUE_FCFA,
          redeem: {
            minPoints: MIN_REDEEM_POINTS,
            minOrderFcfa: MIN_REDEEM_SUBTOTAL,
            canRedeemNow: points >= MIN_REDEEM_POINTS,
            exampleDiscountOnMinOrderFcfa: redeemableDiscount(
              points,
              MIN_REDEEM_SUBTOTAL,
            ),
          },
          earn: {
            perHundredFcfa: POINTS_PER_100_FCFA,
            signupBonus: WELCOME_POINTS,
            referralBonus: REFERRAL_POINTS,
            reviewBonus: REVIEW_POINTS,
          },
          referral: {
            code: dashboard.referral.code ?? null,
            url: dashboard.referral.path ?? "/register",
          },
          rewardsUrl: "/rewards",
        };
      }

      case "get_help_topic": {
        const topic = asString(input.topic) as HelpTopic | undefined;
        if (!topic || !(topic in HELP_TOPICS)) {
          return { error: "Unknown topic.", topics: Object.keys(HELP_TOPICS) };
        }
        return { topic, answer: HELP_TOPICS[topic] };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch {
    return {
      error:
        "That information isn't available right now. Suggest the shop's WhatsApp or phone number.",
    };
  }
}
