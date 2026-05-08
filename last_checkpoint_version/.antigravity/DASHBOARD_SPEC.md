# 02. DASHBOARD INTERFACE SPEC

The Dashboard is the platform's primary observability layer. It reconciles high-frequency data from three distinct sub-engines: Portfolio, Cashflows, and active Budgets.

## KEY METRICS SPECIFICATION

| Engine | Logic & Frequency |
| :--- | :--- |
| **Treasury Lock** | Live Ledger Delta (Real-time) |
| **Freedom Horizon** | Iterative Compounding (600m Capped) |
| **Canonical Mapping** | Merchant-to-Budget Alignment |
| **Vault Allocation** | Historical Surplus Extraction |

---

## CORE PRINCIPLES

### The "Treasury Command" Principle
Unlike traditional dashboards that show static snapshots, WealthLens implements a **Live Reconciliation** engine. Every transaction in your ledger is treated as a delta applied to your base account balance. This ensures that your Net Worth is mathematically accurate to the second, accounting for every cent of inflow and outflow.

### Freedom Horizon (FIRE Engine)
Calculates the exact moment of financial independence using iterative monthly compounding:
`FV = (Current × (1 + r/12)) + Savings`
Models up to 50 years of projections. Includes a **Strategic Sustainability Audit** that warns if your manual targets fall below the 4% safe withdrawal threshold for your current lifestyle.

---

## WIDGET SPECIFICATIONS

### Vault Buckets
Virtual allocation of historical surplus capital into strategic funds (Emergency, Education, Travel) without impacting actual bank liquidity. This allows for "mental accounting" that is mathematically backed by your real-world savings.

### Alignment Engine
Maps high-entropy merchant data to canonical budget categories using pattern recognition to ensure spend accuracy. This solves the "Merchant Name Mystery" where bank labels don't match your budget headers.

### Tactical Liquidity
Visualizes your "Cash Runway" using a 30.42-day month constant. It calculates exactly how many days you can survive at your current "Optimal Outflow" rate before requiring capital extraction from investments.

### Net Worth Reconciler
Uses non-recursive balance aggregation across all integrated accounts. Implements a 'Liquidity Buffer' algorithm to separate true net worth from theoretical market value.
