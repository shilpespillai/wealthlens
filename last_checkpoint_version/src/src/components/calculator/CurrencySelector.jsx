import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const currencies = [
{ code: "USD", symbol: "$", name: "US Dollar" },
{ code: "EUR", symbol: "€", name: "Euro" },
{ code: "GBP", symbol: "£", name: "British Pound" },
{ code: "JPY", symbol: "¥", name: "Japanese Yen" },
{ code: "AUD", symbol: "A$", name: "Australian Dollar" },
{ code: "CAD", symbol: "C$", name: "Canadian Dollar" },
{ code: "CHF", symbol: "Fr", name: "Swiss Franc" },
{ code: "CNY", symbol: "¥", name: "Chinese Yuan" },
{ code: "INR", symbol: "₹", name: "Indian Rupee" },
{ code: "SGD", symbol: "S$", name: "Singapore Dollar" },
{ code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
{ code: "KRW", symbol: "₩", name: "South Korean Won" },
{ code: "BRL", symbol: "R$", name: "Brazilian Real" },
{ code: "ZAR", symbol: "R", name: "South African Rand" },
{ code: "AED", symbol: "د.إ", name: "UAE Dirham" },
{ code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
{ code: "MXN", symbol: "$", name: "Mexican Peso" },
{ code: "SEK", symbol: "kr", name: "Swedish Krona" },
{ code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
{ code: "NOK", symbol: "kr", name: "Norwegian Krone" }];


export function getCurrencySymbol(code) {
  return currencies.find((c) => c.code === code)?.symbol || "$";
}

export default function CurrencySelector({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-[#2D3748] !text-[#E5C48B] px-3 py-2 text-sm font-bold rounded-xl flex w-full items-center justify-between whitespace-nowrap border border-[#E5C48B]/30 shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-[#E5C48B]/50 disabled:cursor-not-allowed disabled:opacity-50 h-10 [&_svg]:!text-[#E5C48B] [&_svg]:!opacity-100 [&_span]:!text-[#E5C48B]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {currencies.map((c) =>
        <SelectItem key={c.code} value={c.code}>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">{c.symbol}</span>
              <span className="text-slate-500">{c.code}</span>
              <span className="text-slate-400 text-xs hidden sm:inline">— {c.name}</span>
            </span>
          </SelectItem>
        )}
      </SelectContent>
    </Select>);

}