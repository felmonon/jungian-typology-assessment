ALTER TABLE "discount_leads"
  ADD COLUMN IF NOT EXISTS "tier_intent" varchar,
  ADD COLUMN IF NOT EXISTS "followup_email_sent" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "followup_email_sent_id" varchar,
  ADD COLUMN IF NOT EXISTS "followup_email_error" text,
  ADD COLUMN IF NOT EXISTS "followup_email_sent_at" timestamp;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_leads_followup_idx"
  ON "discount_leads" USING btree ("followup_email_sent", "created_at");
