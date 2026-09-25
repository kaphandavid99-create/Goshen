-- ============================================================================
-- GOSHEN PROVISION PROJECT - COMPLETE DATABASE SCHEMA
-- E-Commerce Platform for Provision Shop - New Bell, Bamenda
-- Database: PostgreSQL
-- Generated from: Project Report Chapter 5 (Database Design)
-- ============================================================================

-- ============================================================================
-- 1. USER ACCOUNTS TABLE
-- Purpose: Core identity table for all customers, staff, and admin accounts
-- ============================================================================
CREATE TABLE "User" (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255),
    "googleId" VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    "avatarUrl" VARCHAR(255),
    "avatarPublicId" VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('CUSTOMER', 'STAFF', 'ADMIN')),
    "wholesaleStatus" VARCHAR(50) NOT NULL CHECK ("wholesaleStatus" IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED')),
    points INT DEFAULT 0,
    "referralCode" VARCHAR(255),
    "referredById" VARCHAR(255) REFERENCES "User"(id),
    "referralRewarded" BOOLEAN,
    "welcomedAt" TIMESTAMP,
    "lastPointsReminderAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. PRODUCT CATEGORY TABLE
-- Purpose: Organize products into categories for browsing and filtering
-- ============================================================================
CREATE TABLE "Category" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL
);

-- ============================================================================
-- 3. PRODUCT CATALOG TABLE
-- Purpose: Every item Goshen sells with price, stock, and availability info
-- ============================================================================
CREATE TABLE "Product" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    "priceCents" INT NOT NULL,
    "wholesalePriceCents" INT,
    unit VARCHAR(50) NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "stockCount" INT DEFAULT 0,
    "lowStockAt" INT,
    featured BOOLEAN DEFAULT false,
    kind VARCHAR(50) NOT NULL CHECK (kind IN ('SIMPLE', 'BUNDLE')),
    flavors JSONB,
    "categoryId" VARCHAR(255) NOT NULL REFERENCES "Category"(id)
);

-- ============================================================================
-- 4. ORDER TABLE
-- Purpose: Records customer orders with fulfillment and payment info
-- ============================================================================
CREATE TABLE "Order" (
    id VARCHAR(255) PRIMARY KEY,
    "orderNumber" VARCHAR(255) UNIQUE NOT NULL,
    "userId" VARCHAR(255) NOT NULL REFERENCES "User"(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'RECEIVED', 'CANCELLED')),
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('RETAIL', 'WHOLESALE')),
    fulfillment VARCHAR(50) NOT NULL CHECK (fulfillment IN ('DELIVERY', 'PICKUP')),
    "fullName" VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    address VARCHAR(500),
    notes VARCHAR(1000),
    "subtotalCents" INT NOT NULL,
    "deliveryCents" INT DEFAULT 0,
    "discountCents" INT DEFAULT 0,
    "pointsRedeemed" INT DEFAULT 0,
    "totalCents" INT NOT NULL,
    "acceptedAt" TIMESTAMP,
    "receivedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. ORDER ITEM TABLE
-- Purpose: Line items in each order (what products, quantities, flavors)
-- ============================================================================
CREATE TABLE "OrderItem" (
    id VARCHAR(255) PRIMARY KEY,
    "orderId" VARCHAR(255) NOT NULL REFERENCES "Order"(id),
    "productId" VARCHAR(255) REFERENCES "Product"(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    "imageUrl" VARCHAR(500),
    "priceCents" INT NOT NULL,
    quantity INT NOT NULL,
    flavors JSONB
);

-- ============================================================================
-- 6. PAYMENT TABLE
-- Purpose: Payment method and status for each order
-- ============================================================================
CREATE TABLE "Payment" (
    id VARCHAR(255) PRIMARY KEY,
    "orderId" VARCHAR(255) UNIQUE NOT NULL REFERENCES "Order"(id),
    method VARCHAR(50) NOT NULL CHECK (method IN ('CASH', 'MOMO')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED')),
    "amountCents" INT NOT NULL,
    currency VARCHAR(10) DEFAULT 'XAF',
    "momoReferenceId" VARCHAR(255),
    "momoFinancialId" VARCHAR(255),
    attempts INT DEFAULT 0,
    "failureReason" VARCHAR(500),
    "paidAt" TIMESTAMP
);

-- ============================================================================
-- 7. SAVED ADDRESS TABLE
-- Purpose: Customer delivery addresses reused across orders
-- ============================================================================
CREATE TABLE "Address" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES "User"(id),
    label VARCHAR(100),
    "fullName" VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    line VARCHAR(500) NOT NULL,
    "isDefault" BOOLEAN DEFAULT false
);

-- ============================================================================
-- 8. CART SNAPSHOT TABLE
-- Purpose: Server-side mirror of browser shopping cart item count
-- ============================================================================
CREATE TABLE "CartSnapshot" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) UNIQUE NOT NULL REFERENCES "User"(id),
    "itemCount" INT DEFAULT 0,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remindedAt" TIMESTAMP
);

-- ============================================================================
-- 9. NOTIFICATION TABLE
-- Purpose: Messages sent to customers (order updates, promotions, reminders)
-- ============================================================================
CREATE TABLE "Notification" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES "User"(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    href VARCHAR(500),
    "readAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. PUSH SUBSCRIPTION TABLE
-- Purpose: Device endpoints for push notifications (one per device/browser)
-- ============================================================================
CREATE TABLE "PushSubscription" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES "User"(id),
    endpoint VARCHAR(1000) NOT NULL UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. CHAT THREAD TABLE
-- Purpose: Container for AI shopping assistant conversations
-- ============================================================================
CREATE TABLE "ChatThread" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) REFERENCES "User"(id),
    "anonId" VARCHAR(255),
    title VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. CHAT MESSAGE TABLE
-- Purpose: Individual messages in conversations with AI assistant
-- ============================================================================
CREATE TABLE "ChatMessage" (
    id VARCHAR(255) PRIMARY KEY,
    "threadId" VARCHAR(255) NOT NULL REFERENCES "ChatThread"(id),
    role VARCHAR(50) NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
    content TEXT NOT NULL,
    "toolTrace" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 13. PRODUCT REVIEW TABLE
-- Purpose: Customer reviews and ratings for products (verified buyers only)
-- ============================================================================
CREATE TABLE "Review" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES "User"(id),
    "productId" VARCHAR(255) NOT NULL REFERENCES "Product"(id),
    "orderId" VARCHAR(255) NOT NULL REFERENCES "Order"(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 14. WISHLIST ITEM TABLE
-- Purpose: Products a customer saved for later purchases
-- ============================================================================
CREATE TABLE "WishlistItem" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES "User"(id),
    "productId" VARCHAR(255) NOT NULL REFERENCES "Product"(id),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 15. WHOLESALE APPLICATION TABLE
-- Purpose: Business buyer wholesale pricing applications (one per user)
-- ============================================================================
CREATE TABLE "WholesaleApplication" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) UNIQUE NOT NULL REFERENCES "User"(id),
    "businessName" VARCHAR(255) NOT NULL,
    "businessType" VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    note TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    "reviewedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- User indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_wholesale_status ON "User"("wholesaleStatus");

-- Product indexes
CREATE INDEX idx_product_category ON "Product"("categoryId");
CREATE INDEX idx_product_in_stock ON "Product"("inStock");
CREATE INDEX idx_product_featured ON "Product"(featured);

-- Order indexes
CREATE INDEX idx_order_user ON "Order"("userId");
CREATE INDEX idx_order_status ON "Order"(status);
CREATE INDEX idx_order_channel ON "Order"(channel);
CREATE INDEX idx_order_fulfillment ON "Order"(fulfillment);
CREATE INDEX idx_order_created ON "Order"("createdAt");

-- OrderItem indexes
CREATE INDEX idx_orderitem_order ON "OrderItem"("orderId");
CREATE INDEX idx_orderitem_product ON "OrderItem"("productId");

-- Payment indexes
CREATE INDEX idx_payment_order ON "Payment"("orderId");
CREATE INDEX idx_payment_status ON "Payment"(status);
CREATE INDEX idx_payment_method ON "Payment"(method);

-- Address indexes
CREATE INDEX idx_address_user ON "Address"("userId");
CREATE INDEX idx_address_default ON "Address"("isDefault");

-- Notification indexes
CREATE INDEX idx_notification_user ON "Notification"("userId");
CREATE INDEX idx_notification_read ON "Notification"("readAt");

-- PushSubscription indexes
CREATE INDEX idx_push_subscription_user ON "PushSubscription"("userId");

-- ChatThread indexes
CREATE INDEX idx_chat_thread_user ON "ChatThread"("userId");

-- ChatMessage indexes
CREATE INDEX idx_chat_message_thread ON "ChatMessage"("threadId");

-- Review indexes
CREATE INDEX idx_review_product ON "Review"("productId");
CREATE INDEX idx_review_user ON "Review"("userId");
CREATE INDEX idx_review_order ON "Review"("orderId");

-- WishlistItem indexes
CREATE INDEX idx_wishlist_user ON "WishlistItem"("userId");
CREATE INDEX idx_wishlist_product ON "WishlistItem"("productId");

-- WholesaleApplication indexes
CREATE INDEX idx_wholesale_user ON "WholesaleApplication"("userId");
CREATE INDEX idx_wholesale_status ON "WholesaleApplication"(status);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- OrderItem must reference valid order and product
ALTER TABLE "OrderItem"
    ADD CONSTRAINT fk_orderitem_order FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE;

ALTER TABLE "OrderItem"
    ADD CONSTRAINT fk_orderitem_product FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE SET NULL;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Customer order summary
CREATE VIEW customer_order_summary AS
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as total_orders,
    SUM(o."totalCents") as total_spent_fcfa,
    MAX(o."createdAt") as last_order_date,
    u.points as current_loyalty_points
FROM "User" u
LEFT JOIN "Order" o ON u.id = o."userId"
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.name, u.email, u.points;

-- Popular products
CREATE VIEW popular_products AS
SELECT
    p.id,
    p.name,
    p.slug,
    COUNT(oi.id) as times_purchased,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as review_count,
    SUM(oi.quantity) as total_units_sold
FROM "Product" p
LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
LEFT JOIN "Review" r ON p.id = r."productId"
GROUP BY p.id, p.name, p.slug
ORDER BY times_purchased DESC;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
