-- A refunded or disputed purchase must never return to 'completed'. The API
-- already refuses that transition; this trigger closes the race where a
-- webhook redelivery or success-page verification lands at the same moment
-- as the refund.
CREATE OR REPLACE FUNCTION "purchases_keep_revoked_status"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD."status" IN ('refunded', 'disputed') AND NEW."status" = 'completed' THEN
    NEW."status" := OLD."status";
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
DROP TRIGGER IF EXISTS "purchases_keep_revoked_status" ON "purchases";
--> statement-breakpoint
CREATE TRIGGER "purchases_keep_revoked_status"
  BEFORE UPDATE OF "status" ON "purchases"
  FOR EACH ROW
  EXECUTE FUNCTION "purchases_keep_revoked_status"();
--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION "purchases_keep_revoked_status"() FROM anon, authenticated;
