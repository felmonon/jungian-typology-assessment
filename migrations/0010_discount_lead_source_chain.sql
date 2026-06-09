ALTER TABLE "discount_leads"
  ADD COLUMN IF NOT EXISTS "source_chain" varchar;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_leads_source_chain_idx" ON "discount_leads" USING btree ("source_chain");
