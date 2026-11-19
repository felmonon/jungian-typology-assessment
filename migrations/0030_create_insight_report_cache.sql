-- One generated Insight report per completed result. The report tab shows a
-- preview built from this row (one section in full, an opening sentence for
-- the rest); the paid unlock serves the same row instead of generating again.
-- input_hash is a server-side SHA-256 of the cleaned assessment, its
-- completion time and the prompt version; no account, email or answer-level
-- data is stored. Only the service role reads or writes this table, and the
-- API falls back to the previous preview while the migration is not applied.
CREATE TABLE IF NOT EXISTS "insight_report_cache" (
  "input_hash" varchar(64) PRIMARY KEY,
  "prompt_version" varchar NOT NULL,
  "report" jsonb NOT NULL,
  "generation_source" varchar,
  "unlocked_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insight_report_cache_created_at"
  ON "insight_report_cache" USING btree ("created_at");
--> statement-breakpoint
ALTER TABLE "insight_report_cache" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL PRIVILEGES ON TABLE "insight_report_cache" FROM anon, authenticated;
--> statement-breakpoint
GRANT ALL PRIVILEGES ON TABLE "insight_report_cache" TO service_role;
