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
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "funnel_events_event_id_unique"
  ON "funnel_events" USING btree ("event_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_funnel_events_event_name_occurred_at"
  ON "funnel_events" USING btree ("event_name", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_funnel_events_anonymous_id_occurred_at"
  ON "funnel_events" USING btree ("anonymous_id", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_funnel_events_tier"
  ON "funnel_events" USING btree ("tier");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_funnel_events_stripe_session_id"
  ON "funnel_events" USING btree ("stripe_session_id");
--> statement-breakpoint
ALTER TABLE "funnel_events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL PRIVILEGES ON TABLE "funnel_events" FROM anon, authenticated;
--> statement-breakpoint
GRANT ALL PRIVILEGES ON TABLE "funnel_events" TO service_role;
