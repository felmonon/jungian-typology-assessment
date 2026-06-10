-- TypeJung pending production migrations (idempotent, safe to re-run)
-- Apply in Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Generated 2026-06-10 after funnel walk found recovery_emails + funnel_events missing in prod.

-- ============ 0015_create_recovery_emails ============
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

CREATE UNIQUE INDEX IF NOT EXISTS "recovery_emails_stripe_session_id_unique"
  ON "recovery_emails" USING btree ("stripe_session_id");

CREATE INDEX IF NOT EXISTS "idx_recovery_emails_status_send_after"
  ON "recovery_emails" USING btree ("status", "send_after");

CREATE INDEX IF NOT EXISTS "idx_recovery_emails_customer_email"
  ON "recovery_emails" USING btree ("customer_email");

ALTER TABLE "recovery_emails" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE "recovery_emails" FROM anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE "recovery_emails" TO service_role;

-- ============ 0016_create_funnel_events ============
CREATE TABLE IF NOT EXISTS "funnel_events" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" varchar NOT NULL,
  "anonymous_id" varchar,
  "event_name" varchar NOT NULL,
  "source" varchar,
  "path" text,
  "tier" varchar,
  "checkout_intent_id" varchar,
  "stripe_session_id" varchar,
  "purchase_id" varchar,
  "dominant_function" varchar,
  "inferior_function" varchar,
  "reliability" varchar,
  "value" numeric,
  "currency" varchar,
  "properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "occurred_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "funnel_events_event_id_unique"
  ON "funnel_events" USING btree ("event_id");

CREATE INDEX IF NOT EXISTS "idx_funnel_events_event_name_occurred_at"
  ON "funnel_events" USING btree ("event_name", "occurred_at");

CREATE INDEX IF NOT EXISTS "idx_funnel_events_anonymous_id_occurred_at"
  ON "funnel_events" USING btree ("anonymous_id", "occurred_at");

CREATE INDEX IF NOT EXISTS "idx_funnel_events_tier"
  ON "funnel_events" USING btree ("tier");

CREATE INDEX IF NOT EXISTS "idx_funnel_events_stripe_session_id"
  ON "funnel_events" USING btree ("stripe_session_id");

ALTER TABLE "funnel_events" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE "funnel_events" FROM anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE "funnel_events" TO service_role;

-- ============ verification ============
select 'recovery_emails' as t, to_regclass('public.recovery_emails') is not null as exists
union all select 'funnel_events', to_regclass('public.funnel_events') is not null;
