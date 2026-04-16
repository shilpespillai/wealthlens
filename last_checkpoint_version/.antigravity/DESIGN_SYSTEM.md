# WealthLens Design System (Premium Aesthetic)

This document defines the visual standards for the WealthLens Finance Calculator. Refer to these rules for ALL UI changes to maintain the "Institutional/Premium" look.

## 1. Color Palette
- **Backgrounds**: Use `bg-wealthBackground` (#F5F6F8) for main content areas and `bg-white` for cards.
- **Primary Accents**:
    - **Gold/Morningstar Accent**: `#C5A059` (used for titles, focus elements, and chart highlights).
    - **Indigo/Future Blue**: `text-futureBlue` (#5B7DBD) for stability-focused data.
    - **Teal/Positive**: `text-[#00A381]` for success, income, and "within budget" states.
    - **Rose/Negative**: `text-[#E56B6B]` for overspent, debts, and errors.
- **Card Accents**: Use top-borders (`h-1 bg-accentPurple w-full`) to differentiate card types.

## 2. Typography
- **Headings**: Use `font-serif` (Fraunces) for large numbers or high-level totals to add a classical financial feel.
- **Metadata**: Use `text-[10px]` or `text-[11px]`, `font-black`, `uppercase`, and `tracking-widest` for labels, small headers, and button text.
- **Body**: Use `font-sans` (Inter) for transaction lists and inputs.

## 3. Shapes & Shadows
- **Card Corners**: Prefer `rounded-xl` for standard cards and `rounded-[32px]` for large report containers.
- **Shadows**: Use `shadow-sm` for standard depth and `shadow-2xl shadow-slate-200/50` for "floating" hero sections or dark-themed summaries.
- **Borders**: Standard border is `border-slate-100` or `border-slate-200`.

## 4. Chart Standards (Recharts)
- **Curves**: Always use `type="monotone"` for Area and Line charts to create smooth, professional waves.
- **Grids**: Use `CartesianGrid vertical={false} stroke="#f1f5f9"` to keep charts clean.
- **Interactive**: Tooltips should use a dark theme (`bg-[#1E293B]`) with rounded corners and white text to match the navigation bar.

## 5. UI Constants to Maintain
- **Button Icons**: Always use `lucide-react` with `w-3.5 h-3.5` or `w-4 h-4`.
- **Spacing**: Use `p-8` for card padding to allow for high-end "white space."
