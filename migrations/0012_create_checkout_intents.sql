CREATE TABLE IF NOT EXISTS "checkout_intents" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar REFERENCES "users"("id") ON DELETE SET NULL,
  "stripe_session_id" varchar,
  "payment_intent_id" varchar,
  "status" varchar DEFAULT 'started' NOT NULL,
  "tier" varchar,
  "amount" integer,
  "currency" varchar,
  "source" varchar,
  "acquisition_source" varchar,
  "acquisition_ref" varchar,
  "utm_campaign" varchar,
  "utm_source" varchar,
  "shared_result" varchar,
  "parent_source" varchar,
  "source_chain" varchar,
  "checkout_email_source" varchar,
  "has_customer_email" boolean DEFAULT false NOT NULL,
  "recovery_email_consent" varchar,
  "stripe_status" varchar,
  "error_message" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "expires_at" timestamp,
  "completed_at" timestamp,
  "expired_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkout_intents_stripe_session_id_unique"
  ON "checkout_intents" USING btree ("stripe_session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_checkout_intents_status_created_at"
  ON "checkout_intents" USING btree ("status", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_checkout_intents_acquisition_source"
  ON "checkout_intents" USING btree ("acquisition_source");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_checkout_intents_source_chain"
  ON "checkout_intents" USING btree ("source_chain");
--> statement-breakpoint
WITH duplicate_purchases AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY "stripe_session_id"
      ORDER BY "created_at" DESC NULLS LAST, "id" DESC
    ) AS duplicate_rank
  FROM "purchases"
  WHERE "stripe_session_id" IS NOT NULL
)
DELETE FROM "purchases"
USING duplicate_purchases
WHERE "purchases"."id" = duplicate_purchases."id"
  AND duplicate_purchases.duplicate_rank > 1;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "purchases_stripe_session_id_unique"
  ON "purchases" USING btree ("stripe_session_id");
