ALTER TABLE "purchases"
  ADD COLUMN IF NOT EXISTS "source" varchar,
  ADD COLUMN IF NOT EXISTS "acquisition_source" varchar,
  ADD COLUMN IF NOT EXISTS "acquisition_ref" varchar,
  ADD COLUMN IF NOT EXISTS "utm_campaign" varchar,
  ADD COLUMN IF NOT EXISTS "utm_source" varchar,
  ADD COLUMN IF NOT EXISTS "shared_result" varchar,
  ADD COLUMN IF NOT EXISTS "parent_source" varchar,
  ADD COLUMN IF NOT EXISTS "discount_code" varchar,
  ADD COLUMN IF NOT EXISTS "recovery_email_consent" varchar;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_acquisition_source" ON "purchases" USING btree ("acquisition_source");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_utm_source" ON "purchases" USING btree ("utm_source");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_utm_campaign" ON "purchases" USING btree ("utm_campaign");
