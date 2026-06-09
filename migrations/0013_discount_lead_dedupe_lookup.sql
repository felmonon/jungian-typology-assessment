CREATE INDEX IF NOT EXISTS "discount_leads_dedupe_lookup_idx"
  ON "discount_leads" USING btree ("email", "source", "tier_intent", "created_at");
