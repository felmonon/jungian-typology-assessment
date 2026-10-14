-- Addresses that must not receive marketing email from TypeJung.
-- Written by the one-click unsubscribe endpoint (reason 'unsubscribe') and
-- available for bounce/complaint/manual entries. The send helper in
-- server/resend.ts checks this table before every customer email; until the
-- migration is applied the check treats every address as not suppressed.
CREATE TABLE IF NOT EXISTS "email_suppressions" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar NOT NULL,
  "reason" varchar DEFAULT 'unsubscribe' NOT NULL,
  "source" varchar,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_suppressions_email_unique"
  ON "email_suppressions" USING btree ("email");
--> statement-breakpoint
ALTER TABLE "email_suppressions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL PRIVILEGES ON TABLE "email_suppressions" FROM anon, authenticated;
--> statement-breakpoint
GRANT ALL PRIVILEGES ON TABLE "email_suppressions" TO service_role;
