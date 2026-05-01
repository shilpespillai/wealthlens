-- WealthLens High-Density Production Seed Data
-- Target: Portfolios, Budgets, Accounts, and Transactions
-- Coverage: High-density transactions (50% of month days) for realistic reporting.

-- 1. Portfolio Snapshots (Historical Growth Mapping)
INSERT INTO portfolio_holdings (user_id, snapshot_date, label, asset_class, current_value, invested_amount, currency) VALUES
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-11-01', 'US Tech Basket', 'stocks', 42000, 38000, 'USD'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-11-01', 'Sydney Apartment', 'property', 840000, 720000, 'AUD'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-11-01', 'Bitcoin', 'crypto', 12000, 8000, 'USD'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-01', 'US Tech Basket', 'stocks', 44500, 39000, 'USD'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-01', 'Sydney Apartment', 'property', 845000, 720000, 'AUD'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-01', 'Bitcoin', 'crypto', 15000, 8000, 'USD'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-01', 'US Tech Basket', 'stocks', 46000, 40000, 'USD'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-01', 'Sydney Apartment', 'property', 855000, 720000, 'AUD'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-01', 'Bitcoin', 'crypto', 14000, 9000, 'USD');

-- 2. Accounts
INSERT INTO user_accounts (user_id, name, type, category, base_balance, currency) VALUES
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', 'Main Transaction', 'asset', 'Bank Account', 5250, 'AUD'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', 'High-Yield Savings', 'asset', 'Savings', 24800, 'AUD'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', 'Global Visa', 'debt', 'Credit Card', -1240, 'AUD');

-- 3. Monthly Budgets
INSERT INTO budgets (user_id, month, currency, payload) VALUES
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12', 'AUD', '{"visualData": [{"id": "rent", "category": "Rent", "amount": "2200 / mo", "budget": "$2200 spent", "progress": 100}, {"id": "groceries", "category": "Groceries", "amount": "800 / mo", "budget": "$750 spent", "progress": 93}]}'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01', 'AUD', '{"visualData": [{"id": "rent", "category": "Rent", "amount": "2200 / mo", "budget": "$2200 spent", "progress": 100}, {"id": "groceries", "category": "Groceries", "amount": "900 / mo", "budget": "$420 spent", "progress": 46}]}');

-- 4. High-Density Transactions (Jan 2026 - covering ~60% of days)
INSERT INTO transactions (user_id, date, merchant, amount, category, type, spend_type) VALUES
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-01', 'Landlord Corp', -2200.00, 'Rent', 'expense', 'fixed'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-02', 'Woolworths', -85.20, 'Groceries', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-03', 'Shell Direct', -75.00, 'Transport', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-05', 'Starbucks', -7.50, 'Dining', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-06', 'Netflix', -22.99, 'Subscription', 'expense', 'fixed'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-07', 'Gym Membership', -45.00, 'Health', 'expense', 'fixed'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-08', 'Coles', -120.40, 'Groceries', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-10', 'Uber Eats', -42.00, 'Dining', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-12', 'Amazon AU', -129.00, 'Shopping', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-14', 'Woolworths', -64.30, 'Groceries', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-15', 'Monthly Salary', 6500.00, 'Salary', 'income', 'income'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-16', '7-Eleven', -22.00, 'Transport', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-18', 'Local Bistro', -88.00, 'Dining', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-20', 'Apple Services', -14.99, 'Subscription', 'expense', 'fixed'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-22', 'Coles', -95.00, 'Groceries', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-24', 'Movie Night', -35.00, 'Entertainment', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-25', 'Gas/Electric Bill', -312.00, 'Utilities', 'expense', 'fixed'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-26', 'Uber', -28.50, 'Transport', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-28', 'Fresh Produce Market', -45.20, 'Groceries', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2026-01-30', 'Spotify', -11.99, 'Subscription', 'expense', 'fixed');

-- 5. High-Density Transactions (Dec 2025 - covering ~50% of days)
INSERT INTO transactions (user_id, date, merchant, amount, category, type, spend_type) VALUES
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-01', 'Landlord Corp', -2200.00, 'Rent', 'expense', 'fixed'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-02', 'Christmas Market', -150.00, 'Shopping', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-04', 'Woolworths', -110.00, 'Groceries', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-06', 'Petrol Station', -82.00, 'Transport', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-08', 'Dinner Party', -230.00, 'Dining', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-10', 'Netflix', -22.99, 'Subscription', 'expense', 'fixed'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-12', 'Coles', -98.50, 'Groceries', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-15', 'Monthly Salary', 6500.00, 'Salary', 'income', 'income'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-18', 'Gift Shop', -45.00, 'Shopping', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-20', 'Holiday Flights', -450.00, 'Travel', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-22', 'Woolworths', -140.00, 'Groceries', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-24', 'Christmas Eve Dinner', -120.00, 'Dining', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-27', 'Boxing Day Sales', -320.00, 'Shopping', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-29', 'Uber', -42.00, 'Transport', 'expense', 'variable'),
('9de6f6a5-f51a-4e94-a0e8-7359d85cbb14', '2025-12-31', 'NYE Party', -200.00, 'Entertainment', 'expense', 'variable');
