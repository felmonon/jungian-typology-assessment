-- Shared rate-limit counters, so a limit holds across every serverless
-- instance instead of per instance. Keys are "<prefix>:<sha256 of client IP>";
-- raw IPs are not stored. api/_lib/rate-limit.ts falls back to its in-memory
-- limiter when this RPC is missing or fails.
CREATE TABLE IF NOT EXISTS "rate_limits" (
  "key" varchar PRIMARY KEY,
  "count" integer DEFAULT 0 NOT NULL,
  "reset_at" timestamptz NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rate_limits_reset_at"
  ON "rate_limits" USING btree ("reset_at");
--> statement-breakpoint
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL PRIVILEGES ON TABLE "rate_limits" FROM anon, authenticated;
--> statement-breakpoint
GRANT ALL PRIVILEGES ON TABLE "rate_limits" TO service_role;
--> statement-breakpoint
-- Atomically counts one hit for p_key and returns the count in the current
-- window and when that window resets.
CREATE OR REPLACE FUNCTION "rate_limit_hit"(p_key text, p_window_ms integer)
RETURNS TABLE ("count" integer, "reset_at" timestamptz)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  -- Occasional cleanup of long-expired windows keeps the table small.
  IF random() < 0.01 THEN
    DELETE FROM "rate_limits" WHERE "rate_limits"."reset_at" < now() - interval '1 day';
  END IF;

  RETURN QUERY
  INSERT INTO "rate_limits" AS rl ("key", "count", "reset_at")
  VALUES (p_key, 1, now() + make_interval(secs => p_window_ms / 1000.0))
  ON CONFLICT ("key") DO UPDATE SET
    "count" = CASE WHEN rl."reset_at" <= now() THEN 1 ELSE rl."count" + 1 END,
    "reset_at" = CASE
      WHEN rl."reset_at" <= now() THEN now() + make_interval(secs => p_window_ms / 1000.0)
      ELSE rl."reset_at"
    END
  RETURNING rl."count", rl."reset_at";
END;
$$;
--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION "rate_limit_hit"(text, integer) FROM PUBLIC, anon, authenticated;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "rate_limit_hit"(text, integer) TO service_role;
