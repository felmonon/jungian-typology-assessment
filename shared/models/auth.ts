import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"),
  googleId: varchar("google_id").unique(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const assessmentResults = pgTable("assessment_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  scores: jsonb("scores").notNull(),
  stack: jsonb("stack").notNull(),
  attitudeScore: varchar("attitude_score").notNull(),
  isUndifferentiated: varchar("is_undifferentiated").notNull(),
  shareSlug: varchar("share_slug").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AssessmentResult = typeof assessmentResults.$inferSelect;
export type InsertAssessmentResult = typeof assessmentResults.$inferInsert;

export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  stripeSessionId: varchar("stripe_session_id"),
  paymentIntentId: varchar("payment_intent_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  customerEmail: varchar("customer_email"),
  amount: integer("amount"),
  currency: varchar("currency"),
  status: varchar("status"),
  tier: varchar("tier"),
  source: varchar("source"),
  acquisitionSource: varchar("acquisition_source"),
  acquisitionRef: varchar("acquisition_ref"),
  utmCampaign: varchar("utm_campaign"),
  utmSource: varchar("utm_source"),
  sharedResult: varchar("shared_result"),
  parentSource: varchar("parent_source"),
  sourceChain: varchar("source_chain"),
  discountCode: varchar("discount_code"),
  recoveryEmailConsent: varchar("recovery_email_consent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

export const checkoutIntents = pgTable(
  "checkout_intents",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
    stripeSessionId: varchar("stripe_session_id"),
    paymentIntentId: varchar("payment_intent_id"),
    status: varchar("status").notNull().default("started"),
    tier: varchar("tier"),
    amount: integer("amount"),
    currency: varchar("currency"),
    source: varchar("source"),
    acquisitionSource: varchar("acquisition_source"),
    acquisitionRef: varchar("acquisition_ref"),
    utmCampaign: varchar("utm_campaign"),
    utmSource: varchar("utm_source"),
    sharedResult: varchar("shared_result"),
    parentSource: varchar("parent_source"),
    sourceChain: varchar("source_chain"),
    checkoutEmailSource: varchar("checkout_email_source"),
    hasCustomerEmail: boolean("has_customer_email").notNull().default(false),
    recoveryEmailConsent: varchar("recovery_email_consent"),
    stripeStatus: varchar("stripe_status"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
    completedAt: timestamp("completed_at"),
    expiredAt: timestamp("expired_at"),
  },
  (table) => [
    index("idx_checkout_intents_status_created_at").on(table.status, table.createdAt),
    index("idx_checkout_intents_acquisition_source").on(table.acquisitionSource),
    index("idx_checkout_intents_source_chain").on(table.sourceChain),
  ],
);

export type CheckoutIntent = typeof checkoutIntents.$inferSelect;
export type InsertCheckoutIntent = typeof checkoutIntents.$inferInsert;
