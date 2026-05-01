-- Secure RPC for Admin Analytics
-- This function runs with 'SECURITY DEFINER' to allow the Admin user 
-- to see aggregate stats from auth.users without exposing individual secrets.

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_count INT;
    premium_count INT;
    free_count INT;
    recent_users JSONB;
BEGIN
    -- 1. Total Count
    SELECT COUNT(*) INTO total_count FROM auth.users;
    
    -- 2. Premium Count (checking user_metadata)
    SELECT COUNT(*) INTO premium_count 
    FROM auth.users 
    WHERE (raw_user_meta_data->>'is_premium')::boolean = true;
    
    -- 3. Free Count
    free_count := total_count - premium_count;
    
    -- 4. Recent Signups (Last 5)
    SELECT jsonb_agg(u) INTO recent_users
    FROM (
        SELECT 
            id, 
            email, 
            created_at, 
            last_sign_in_at,
            (raw_user_meta_data->>'full_name') as name,
            (raw_user_meta_data->>'is_premium')::boolean as is_premium
        FROM auth.users
        ORDER BY created_at DESC
        LIMIT 5
    ) u;

    RETURN jsonb_build_object(
        'total_users', total_count,
        'premium_users', premium_count,
        'free_users', free_count,
        'recent_signups', COALESCE(recent_users, '[]'::jsonb)
    );
END;
$$;

-- Grant permission to authenticated users (we check for admin role in frontend)
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;
