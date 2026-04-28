# WealthLens Dashboard Specification

This document provides a deep technical and functional breakdown of the WealthLens Dashboard. It serves as the single source of truth for widget behavior, data flow, and calculation logic.

## 1. Core Data Architecture

The dashboard operates on a **Converged Data Model**. It synchronizes three distinct sources into a unified state:
1.  **Relational Database (PostgreSQL)**: Stores the raw Ledger (transactions), Accounts (metadata), and Portfolio (holdings).
2.  **Secure Vault (JSON Storage)**: Stores user-specific configurations, virtual allocations, and UI layouts.
3.  **Live Ledger Delta Engine**: Calculates real-time balances by applying every historical transaction to the baseline account values, ensuring "Latest Truth" without data drift.

---

## 2. Global Metric Engine (`holisticMetrics`)

The header metrics drive the "Treasury Command" experience.

### Wealth Score (0-100)
*   **Purpose**: A qualitative measure of financial health.
*   **Logic**: Weighted sum of:
    *   **Savings Velocity**: (25 points) Scaled to 40% target.
    *   **Cash Runway**: (25 points) Scaled to a 6-month safety buffer.
    *   **Net Worth Momentum**: Calculated based on asset growth vs liabilities.

### Cash Runway
*   **Data Source**: `Total Liquid Assets / Monthly Spend Target`.
*   **Calculation**: Takes the current balance of all positive cash/savings accounts and divides it by the total monthly targets defined in the Budget Planner.
*   **Thresholds**: 
    *   **Healthy**: > 6 months (Emerald).
    *   **Stable**: 3-6 months (Amber).
    *   **Critical**: < 3 months (Rose).

---

## 3. Widget Specifications

### A. Freedom Horizon (Retirement Engine)
*   **Internal ID**: `fire_gauge`
*   **Functional Goal**: Models the "Magic Number" and the exact date of financial independence.
*   **Calculation Logic**: 
    *   Uses an **Iterative Compounding Algorithm**.
    *   `Projected = (Current * (1 + monthly_rate)) + monthly_savings`.
    *   Iterates monthly for up to 600 months (50 years) to find the intersection with the target capital.
*   **Data Injection**: 
    *   `current_capital`: Net Worth (Accounts + Portfolio).
    *   `monthly_savings`: Live delta between Inflow and Outflow from the ledger.
    *   `fire_config`: Persistent settings from the Vault (`multiplier`, `expectedReturn`, `manualTarget`).

### B. Vault Allocation (The "Common Place")
*   **Internal ID**: `vault_allocation`
*   **Functional Goal**: Distributes historical surplus into virtual buckets.
*   **Data Source**: 
    *   **Surplus**: Calculated by `Total Historical Income - Total Historical Expense`.
    *   **Allocations**: Managed via virtual sliders and saved to `wl_capital_allocation` in the Vault.
*   **Integration**: Ensures that "Unallocated Cash" is always accounted for, preventing capital leak.

### C. Your Treasury (Asset Allocation)
*   **Internal ID**: `accounts`
*   **Functional Goal**: High-fidelity visualization of the total portfolio.
*   **Data Flow**:
    *   **Cash**: Derived from `user_accounts` table + transaction deltas.
    *   **Investments**: Fetched from `portfolio_holdings`, then passed through the `portfolioEngine.js` for real-time valuation based on historical cost and current yields.
    *   **Liabilities**: Aggregated from accounts with negative balances (Debt/Credit/Loans).

### D. Tactical Liquidity
*   **Internal ID**: `liquidity_runway`
*   **Functional Goal**: Visualizes the "Daily Allowance" and safety buffer.
*   **Data Injection**: Uses the `avgMonthlySpend` derived from active budget targets.
*   **Constraint**: It uses a 30.42-day month constant to calculate daily burn precision.

### E. Consumption Targets
*   **Internal ID**: `budgets_short` / `budgets_detailed`
*   **Functional Goal**: Real-time budget vs. actual tracking.
*   **Logic (The Alignment Engine)**: 
    *   Uses `useFinancialParser` to resolve "Canonical Categories." 
    *   If a transaction is labeled "Food" and the budget is "Dining," the engine maps them to a common identifier to ensure accuracy regardless of bank naming conventions.
    *   **Actuals**: Sum of all expenses in the current month ledger for that category.
    *   **Targets**: Sourced from the `budgets` table for the active month.

### F. Savings Velocity
*   **Internal ID**: `velocity`
*   **Functional Goal**: Gauges efficiency of wealth extraction.
*   **Logic**: `(Gross Income - Gross Expense) / Gross Income`.
*   **Data Source**: Filtered by the active dashboard "Time Horizon" (e.g., This Month, Rolling Year).

---

## 4. UI Persistence Engine

*   **Layout Engine**: The dashboard uses a `DragDropContext`.
*   **Saving**: Any movement of widgets is instantly persisted to `wl_dashboard_layout` in the Vault.
*   **Initialization**: On load, the system checks the Vault first. If empty, it falls back to the `calc_params` in the user's profile metadata.

## 5. Ensuring Accuracy

To maintain data integrity across these widgets:
1.  **Never Use Dummy Data**: All widgets must default to `0` or `null` if the database is unreachable.
2.  **Canonical Categories**: Always use the `resolveCanonicalCategory` utility when aggregating transactions to ensure they match budget headers.
3.  **Treasury Lock**: Net Worth must always include the **Live Delta** from transactions, not just the static account balance stored in the database.
