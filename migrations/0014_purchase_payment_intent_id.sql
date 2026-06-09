ALTER TABLE "purchases"
  ADD COLUMN IF NOT EXISTS "payment_intent_id" varchar;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_payment_intent_id"
  ON "purchases" USING btree ("payment_intent_id");
--> statement-breakpoint
UPDATE "purchases"
SET "payment_intent_id" = "checkout_intents"."payment_intent_id"
FROM "checkout_intents"
WHERE "purchases"."stripe_session_id" = "checkout_intents"."stripe_session_id"
  AND "purchases"."payment_intent_id" IS NULL
  AND "checkout_intents"."payment_intent_id" IS NOT NULL;
