-- Pin the trigger function's search_path (Supabase advisor: function_search_path_mutable).
ALTER FUNCTION "purchases_keep_revoked_status"() SET search_path = public;
