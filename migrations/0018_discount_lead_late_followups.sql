-- Late drip steps (emails 4 and 5) for the discount-lead sequence.
-- The cron processor treats these columns as optional and skips the late
-- stages until this migration is applied, so applying it simply activates them.
ALTER TABLE "discount_leads"
  ADD COLUMN IF NOT EXISTS "third_followup_email_sent" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "third_followup_email_sent_id" varchar,
  ADD COLUMN IF NOT EXISTS "third_followup_email_error" text,
  ADD COLUMN IF NOT EXISTS "third_followup_email_sent_at" timestamp,
  ADD COLUMN IF NOT EXISTS "fourth_followup_email_sent" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "fourth_followup_email_sent_id" varchar,
  ADD COLUMN IF NOT EXISTS "fourth_followup_email_error" text,
  ADD COLUMN IF NOT EXISTS "fourth_followup_email_sent_at" timestamp;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_discount_leads_third_followup"
  ON "discount_leads" USING btree ("second_followup_email_sent", "third_followup_email_sent", "second_followup_email_sent_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_discount_leads_fourth_followup"
  ON "discount_leads" USING btree ("third_followup_email_sent", "fourth_followup_email_sent", "third_followup_email_sent_at");
