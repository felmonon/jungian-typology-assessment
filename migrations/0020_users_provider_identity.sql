-- Provider identity for sign-in accounts.
-- apple_id: the Apple "sub" claim, so an Apple account is recognised by its
--   identity rather than only by email, and so Apple rows are no longer
--   indistinguishable from unclaimed rows.
-- email_verified_at: set when Google or Apple vouches for the address. Purchase
--   linking by email only trusts accounts with a verified email. Password
--   signups have no verification flow and leave it null.
-- The API tolerates these columns being absent until this is applied; until
-- then Apple sign-ins are not recorded as verified.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "apple_id" varchar;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_apple_id_unique"
  ON "users" USING btree ("apple_id");
