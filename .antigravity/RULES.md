# Project Rules & Guidelines

These rules ensure technical consistency and minimize "mistakes" during the transition between features.

## 1. Authentication & Security
- **AuthGuard**: Every page or major feature must be wrapped in `<AuthGuard>` to ensure protected data access.
- **base44Client**: Use the centralized `base44` object from `@/api/base44Client` for all backend interactions. 

## 2. Page Structure
- **Global Background**: The root container of all main pages should be `min-h-screen bg-wealthBackground`.
- **Navbar/Panel Separation**: Main content panels must start strictly below the navbar to avoid visual background bleed.
- **Breadcrumbs**: Maintain the breadcrumb pattern in reports (e.g., `Trends › CategoryName`) to help with navigation context.

## 3. Data Flow
- **LocalStorage**: Currently, the app uses LocalStorage (e.g., `wealthlens-calc-state`, `wealthlens-budget-YYYY-MM`) as a persistence layer. Always check LocalStorage first before defaulting to empty mock data.
- **Param Passing**: Use `useSearchParams` or `useLocation` to pass context (like categories) between pages (e.g., from Budget Planner to Trends).

## 4. Common Mistake Prevention
- **String Concatenation**: When rendering labels like "Actual" + "Value", always ensure a space or delimiter is included (`Actual: $1,234` not `Actual$1,234`).
- **Responsive Overflow**: For complex tables (like in `SetBudget.jsx`), ensure they are wrapped in `overflow-x-auto` to prevent layout breaks on smaller viewports.
- **Duplicate IDs**: Ensure all new interactive elements have unique, descriptive IDs for future browser testing. 

## 5. Development to Production
- Pull mock data into centralized variables at the top of the file so they are easy to identify and eventually replace with API calls.
