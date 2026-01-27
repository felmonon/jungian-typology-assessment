-- Performance indexes for frequently queried columns

-- Assessment results indexes
CREATE INDEX IF NOT EXISTS "idx_assessment_results_user_id" ON "assessment_results" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_assessment_results_created_at" ON "assessment_results" USING btree ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_assessment_results_share_slug" ON "assessment_results" USING btree ("share_slug");

-- Purchases indexes
CREATE INDEX IF NOT EXISTS "idx_purchases_user_id" ON "purchases" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_purchases_status" ON "purchases" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_purchases_stripe_session_id" ON "purchases" USING btree ("stripe_session_id");

-- Users indexes
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" USING btree ("created_at");

-- Composite index for common leaderboard query
CREATE INDEX IF NOT EXISTS "idx_assessment_results_stack_dominant" ON "assessment_results" USING gin ("stack" jsonb_path_ops);
