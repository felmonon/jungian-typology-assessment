CREATE TABLE IF NOT EXISTS "discount_leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"user_id" varchar,
	"source" varchar DEFAULT 'unknown' NOT NULL,
	"discount_code" varchar NOT NULL,
	"percent_off" integer NOT NULL,
	"dominant_label" varchar,
	"inferior_label" varchar,
	"email_sent" boolean DEFAULT false NOT NULL,
	"email_sent_id" varchar,
	"email_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'discount_leads_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "discount_leads"
      ADD CONSTRAINT "discount_leads_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_leads_email_idx" ON "discount_leads" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_leads_created_at_idx" ON "discount_leads" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_leads_source_idx" ON "discount_leads" USING btree ("source");
--> statement-breakpoint
ALTER TABLE "discount_leads" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL PRIVILEGES ON TABLE "discount_leads" FROM anon, authenticated;
--> statement-breakpoint
GRANT ALL PRIVILEGES ON TABLE "discount_leads" TO service_role;
