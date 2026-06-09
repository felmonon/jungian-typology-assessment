ALTER TABLE "discount_leads"
  ADD COLUMN IF NOT EXISTS "second_followup_email_sent" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "second_followup_email_sent_id" varchar,
  ADD COLUMN IF NOT EXISTS "second_followup_email_error" text,
  ADD COLUMN IF NOT EXISTS "second_followup_email_sent_at" timestamp;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_leads_second_followup_idx"
  ON "discount_leads" USING btree ("second_followup_email_sent", "followup_email_sent_at");
