import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getCurrencySymbol } from "./CurrencySelector";
import { motion, AnimatePresence } from "framer-motion";

function fmt(num, sym) {
  return `${sym}${num.toLocaleString()}`;
}

export default function YearlyBreakdown({ data, currency }) {
  const [expanded, setExpanded] = useState(false);
  const sym = getCurrencySymbol(currency);
  const displayData = expanded ? data : data.slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Year</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contributed</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portfolio Value</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gains</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Real Value</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">After Tax</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {displayData.map((row) => (
                <motion.tr
                  key={row.year}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-semibold text-slate-700 text-sm">{row.year}</TableCell>
                  <TableCell className="text-sm text-slate-500">{fmt(row.totalContributed, sym)}</TableCell>
                  <TableCell className="text-sm font-semibold text-indigo-600">{fmt(row.nominalValue, sym)}</TableCell>
                  <TableCell className="text-sm text-emerald-600 font-medium">{fmt(row.gains, sym)}</TableCell>
                  <TableCell className="text-sm text-amber-600">{fmt(row.realValue, sym)}</TableCell>
                  <TableCell className="text-sm text-blue-600">{fmt(row.afterTax, sym)}</TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      {data.length > 5 && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            {expanded ? (
              <>Show Less <ChevronUp className="w-3 h-3 ml-1" /></>
            ) : (
              <>Show All {data.length} Years <ChevronDown className="w-3 h-3 ml-1" /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}