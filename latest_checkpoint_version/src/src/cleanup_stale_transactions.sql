-- ============================================================
-- WealthLens: Stale Transaction Inspection
-- Run these queries in Supabase to identify records with
-- incorrect aggregated amounts. Review before any deletion.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- STEP 1 ▸ Find rows where the SAME amount appears on
--          multiple transactions for the same user+type+month.
--          These are likely aggregated budget totals, not
--          real individual transactions.
-- ────────────────────────────────────────────────────────────
SELECT
    user_id,
    type,
    amount,
    COUNT(*)        AS duplicate_count,
    MIN(date)       AS first_seen,
    MAX(date)       AS last_seen,
    STRING_AGG(merchant, ', ' ORDER BY date) AS merchants
FROM transactions
GROUP BY user_id, type, amount
HAVING COUNT(*) > 1          -- same amount on more than one row
ORDER BY duplicate_count DESC, amount DESC;


-- ────────────────────────────────────────────────────────────
-- STEP 2 ▸ Full detail view of the suspicious rows
--          (replace 6965.42 and 143.11 with amounts from above)
-- ────────────────────────────────────────────────────────────
SELECT id, user_id, date, merchant, amount, category, type, spend_type, created_at
FROM transactions
WHERE amount IN (6965.42, 143.11)
ORDER BY user_id, date;


-- ────────────────────────────────────────────────────────────
-- STEP 3 ▸ Once you've identified specific IDs to remove,
--          delete only by ID (safest approach)
-- ────────────────────────────────────────────────────────────
-- DELETE FROM transactions
-- WHERE id IN (
--     'paste-uuid-here',
--     'paste-uuid-here'
-- );
