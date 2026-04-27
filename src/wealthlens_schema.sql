-- WealthLens Production Schema (PostgreSQL / Supabase)
-- Target: High-performance financial reporting suite

-- 0. Cleanup (Optional: uncomment to reset schema)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS portfolio_holdings CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS monthly_summaries CASCADE;
DROP TABLE IF EXISTS user_data CASCADE;

-- 1. Accounts Table
CREATE TABLE IF NOT EXISTS user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('asset', 'debt')),
    category TEXT NOT NULL,
    base_balance NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'AUD',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES user_accounts(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    merchant TEXT,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    spend_type TEXT DEFAULT 'variable', -- 'fixed' or 'variable'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date ON transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_category ON transactions (user_id, category);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id_date ON transactions (account_id, date DESC);

-- 4. Portfolio Holdings (Historical Snapshots)
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    label TEXT NOT NULL,
    asset_class TEXT NOT NULL,
    current_value NUMERIC NOT NULL,
    invested_amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'AUD',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, label, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user_date ON portfolio_holdings (user_id, snapshot_date DESC);

-- 5. Budgets Table (Per-month Category Planning)
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month CHAR(7) NOT NULL, -- Format: YYYY-MM
    currency TEXT DEFAULT 'AUD',
    payload JSONB DEFAULT '{}', -- Store categories and amounts
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, month)
);

-- 6. Monthly Summaries (Pre-Aggregation for Reports)
CREATE TABLE IF NOT EXISTS monthly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month CHAR(7) NOT NULL, -- Format: YYYY-MM
    income_total NUMERIC DEFAULT 0,
    expense_total NUMERIC DEFAULT 0,
    category_breakdown JSONB DEFAULT '{}',
    transaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_month ON monthly_summaries (user_id, month DESC);

-- 7. User Data (Generic Key-Value Store)
CREATE TABLE IF NOT EXISTS user_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for global settings
    key TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, key)
);

-- 8. User Categories (Custom Classification Registry)
CREATE TABLE IF NOT EXISTS user_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon_id TEXT DEFAULT 'circle',
    color TEXT DEFAULT 'slate',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, name)
);

-- 9. Row Level Security (RLS)
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

-- 10. Policies
CREATE POLICY "Users can only see their own accounts" ON user_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own portfolio" ON portfolio_holdings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own budget" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own summaries" ON monthly_summaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own data" ON user_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own categories" ON user_categories FOR ALL USING (auth.uid() = user_id);

-- 8. Automation Trigger for Pre-Aggregation (Optional but recommended)
-- This function would be triggered after transaction inserts to keep summaries updated.
-- To be implemented in Supabase Dashboard.
