CREATE TABLE IF NOT EXISTS "recovery_emails" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "stripe_session_id" varchar NOT NULL,
  "checkout_intent_id" varchar,
  "customer_email" varchar,
  "tier" varchar,
  "recovery_url" text,
  "stripe_recovery_url" text,
  "consent_source" varchar,
  "status" varchar DEFAULT 'queued' NOT NULL,
  "send_after" timestamp,
  "sent_at" timestamp,
  "skipped_at" timestamp,
  "failed_at" timestamp,
  "resend_email_id" varchar,
  "error_message" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "recovery_emails_stripe_session_id_unique"
  ON "recovery_emails" USING btree ("stripe_session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recovery_emails_status_send_after"
  ON "recovery_emails" USING btree ("status", "send_after");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recovery_emails_customer_email"
  ON "recovery_emails" USING btree ("customer_email");
--> statement-breakpoint
ALTER TABLE "recovery_emails" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL PRIVILEGES ON TABLE "recovery_emails" FROM anon, authenticated;
--> statement-breakpoint
GRANT ALL PRIVILEGES ON TABLE "recovery_emails" TO service_role;
