ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "customer_email" varchar;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_customer_email" ON "purchases" USING btree ("customer_email");
