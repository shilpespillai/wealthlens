-- ============================================================
-- WealthLens: Category Registry Migration
-- Purpose : Create the user_categories table (if missing),
--           then seed the canonical CORE_CATEGORY_REGISTRY
--           for EVERY registered user.
-- Run on  : Supabase SQL Editor (service_role / admin context)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- STEP 1 ▸ Create user_categories table if it doesn't exist
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_categories (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    type       TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon_id    TEXT DEFAULT 'circle',
    color      TEXT DEFAULT 'slate',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

-- Drop policy if it already exists (safe re-run)
DROP POLICY IF EXISTS "Users can only see their own categories" ON user_categories;

-- RLS: users can only access their own rows
CREATE POLICY "Users can only see their own categories"
    ON user_categories FOR ALL
    USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- STEP 2 ▸ Purge any existing rows (safe for first run too)
-- ────────────────────────────────────────────────────────────
DELETE FROM user_categories;


-- ────────────────────────────────────────────────────────────
-- STEP 3 ▸ Re-seed canonical categories for every registered
--          user.  One row per (user_id, category) pair using
--          INSERT … ON CONFLICT DO NOTHING to stay idempotent.
-- ────────────────────────────────────────────────────────────
INSERT INTO user_categories (user_id, name, type, icon_id, color, created_at, updated_at)
SELECT
    u.id                AS user_id,
    c.name              AS name,
    c.type              AS type,
    c.icon_id           AS icon_id,
    c.color             AS color,
    now()               AS created_at,
    now()               AS updated_at
FROM auth.users u
CROSS JOIN (
    VALUES
    -- ── Income ──────────────────────────────────────────────
    ('Income',            'income',  'trending-up',     'emerald'),

    -- ── Expenses ────────────────────────────────────────────
    ('Housing',           'expense', 'home',            'indigo'),
    ('Utilities',         'expense', 'zap',             'sky'),
    ('Financial',         'expense', 'banknote',        'slate'),
    ('Groceries',         'expense', 'shopping-cart',   'orange'),
    ('Dining & Food',     'expense', 'utensils',        'amber'),
    ('Fuel & Transport',  'expense', 'fuel',            'purple'),
    ('Healthcare',        'expense', 'activity',        'yellow'),
    ('Lifestyle',         'expense', 'heart',           'rose'),
    ('Insurance',         'expense', 'shield',          'blue'),
    ('Education',         'expense', 'graduation-cap',  'violet'),
    ('Travel',            'expense', 'plane',           'cyan'),
    ('Shopping',          'expense', 'shopping-bag',    'pink'),
    ('Gifts & Donations', 'expense', 'gift',            'red'),
    ('Maintenance',       'expense', 'wrench',          'grey'),
    ('Uncategorized',     'expense', 'circle',          'slate')
) AS c(name, type, icon_id, color)
ON CONFLICT (user_id, name) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- STEP 3 ▸ (Optional) Update the category column in existing
--          transactions that still carry old income labels so
--          that they map to the canonical "Income" category.
-- ────────────────────────────────────────────────────────────
UPDATE transactions
SET    category    = 'Income',
       updated_at  = now()
WHERE  LOWER(category) IN (
    'salary',
    'wages',
    'salary and wages',
    'salary & wages',
    'payroll',
    'monthly salary',
    'rent income',
    'rental income',
    'investment income',
    'dividend',
    'interest'
)
AND    type = 'income';

-- Also normalise the Dining alias ─────────────────────────────
UPDATE transactions
SET    category    = 'Dining & Food',
       updated_at  = now()
WHERE  LOWER(category) IN ('dining', 'dining out', 'dining and food', 'eating out', 'takeaway', 'cafe', 'restaurants')
AND    type = 'expense';

-- Fuel alias ─────────────────────────────────────────────────
UPDATE transactions
SET    category    = 'Fuel & Transport',
       updated_at  = now()
WHERE  LOWER(category) IN ('fuel', 'transport', 'petrol', 'gas', 'uber', 'fuel & gas', 'parking', 'train', 'bus')
AND    type = 'expense';

-- Gifts alias ─────────────────────────────────────────────────
UPDATE transactions
SET    category    = 'Gifts & Donations',
       updated_at  = now()
WHERE  LOWER(category) IN ('gifts', 'donations', 'charity', 'presents')
AND    type = 'expense';


-- ────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES ─ run these individually to confirm
-- ────────────────────────────────────────────────────────────

-- 1. Count of canonical categories seeded per user
-- SELECT user_id, COUNT(*) AS category_count
-- FROM user_categories
-- GROUP BY user_id
-- ORDER BY user_id;

-- 2. Confirm "Income" exists for every user
-- SELECT user_id, name, type
-- FROM user_categories
-- WHERE name = 'Income'
-- ORDER BY user_id;

-- 3. Confirm no legacy income labels remain in transactions
-- SELECT DISTINCT category, type
-- FROM transactions
-- WHERE type = 'income'
-- ORDER BY category;
