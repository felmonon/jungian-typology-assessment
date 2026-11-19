-- checkout_intents was created after 0003 locked down the public schema, so
-- RLS was never enabled on it. It has no anon/authenticated grants and no
-- policies; the API reaches it with the service role, which bypasses RLS.
ALTER TABLE "checkout_intents" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL PRIVILEGES ON TABLE "checkout_intents" FROM anon, authenticated;
--> statement-breakpoint
GRANT ALL PRIVILEGES ON TABLE "checkout_intents" TO service_role;
