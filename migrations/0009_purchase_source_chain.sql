ALTER TABLE "purchases"
  ADD COLUMN IF NOT EXISTS "source_chain" varchar;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_source_chain" ON "purchases" USING btree ("source_chain");
