ALTER TABLE "assessment_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE "assessment_results" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "purchases" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "sessions" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "users" FROM anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE "assessment_results" TO service_role;
GRANT ALL PRIVILEGES ON TABLE "purchases" TO service_role;
GRANT ALL PRIVILEGES ON TABLE "sessions" TO service_role;
GRANT ALL PRIVILEGES ON TABLE "users" TO service_role;
