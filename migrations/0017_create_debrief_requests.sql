CREATE TABLE IF NOT EXISTS "debrief_requests" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "request_id" varchar NOT NULL,
  "user_id" varchar,
  "email" varchar NOT NULL,
  "result_summary" text,
  "tested_as" text,
  "stuck_between" text,
  "felt_accurate" text,
  "felt_confusing" text,
  "source" varchar,
  "status" varchar DEFAULT 'started' NOT NULL,
  "stripe_session_id" varchar,
  "paid_at" timestamp,
  "delivered_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "debrief_requests_request_id_unique"
  ON "debrief_requests" USING btree ("request_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_debrief_requests_status"
  ON "debrief_requests" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_debrief_requests_email"
  ON "debrief_requests" USING btree ("email");
--> statement-breakpoint
ALTER TABLE "debrief_requests" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL PRIVILEGES ON TABLE "debrief_requests" FROM anon, authenticated;
--> statement-breakpoint
GRANT ALL PRIVILEGES ON TABLE "debrief_requests" TO service_role;
