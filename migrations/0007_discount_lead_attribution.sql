ALTER TABLE "discount_leads"
  ADD COLUMN IF NOT EXISTS "utm_source" varchar,
  ADD COLUMN IF NOT EXISTS "utm_campaign" varchar,
  ADD COLUMN IF NOT EXISTS "parent_source" varchar;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_leads_utm_source_idx" ON "discount_leads" USING btree ("utm_source");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_leads_utm_campaign_idx" ON "discount_leads" USING btree ("utm_campaign");
