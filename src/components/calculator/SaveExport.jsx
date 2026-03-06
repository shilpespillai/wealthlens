import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Save, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getCurrencySymbol } from "./CurrencySelector";
import { generatePdfReport } from "./generatePdfReport";

export default function SaveExport({ params, instrument, results, chartRef }) {
  const [saveName, setSaveName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: savedCalculations = [] } = useQuery({
    queryKey: ['savedCalculations'],
    queryFn: () => base44.entities.SavedCalculation.list('-created_date', 50)
  });

  const saveCalculation = useMutation({
    mutationFn: async (name) => {
      await base44.entities.SavedCalculation.create({
        name,
        instrument,
        ...params,
        finalValue: results.summary.finalPortfolioValue,
        totalReturn: results.summary.totalReturns
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCalculations'] });
      toast.success("Calculation saved successfully");
      setSaveDialogOpen(false);
      setSaveName("");
    }
  });

  const deleteCalculation = useMutation({
    mutationFn: (id) => base44.entities.SavedCalculation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCalculations'] });
      toast.success("Calculation deleted");
    }
  });

  const exportToPDF = async () => {
    const loadingToast = toast.loading("Generating PDF report...");
    try {
      await generatePdfReport({ params, results, instrument });
      toast.dismiss(loadingToast);
      toast.success("PDF report downloaded!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Save Calculation */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="bg-orange-200 text-slate-700 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground h-8 border-white/10 hover:bg-slate-800/60">
            <Save className="w-4 h-4 mr-2" />
            Save Calculation
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-800 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Save Calculation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-slate-300">Calculation Name</Label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., My Retirement Plan"
                className="bg-slate-700/30 border-white/10 text-white mt-2" />

            </div>
            <Button
              onClick={() => saveCalculation.mutate(saveName)}
              disabled={!saveName.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-500">

              Save
            </Button>
            
            {/* Saved Calculations List */}
            {savedCalculations.length > 0 &&
            <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="text-sm font-semibold mb-3">Saved Calculations</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {savedCalculations.map((calc) =>
                <div key={calc.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3 border border-white/5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{calc.name}</p>
                        <p className="text-xs text-slate-400">
                          {calc.instrument} • {getCurrencySymbol(calc.currency)}{calc.finalValue?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCalculation.mutate(calc.id)}
                    className="text-slate-400 hover:text-red-400 ml-2">

                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                )}
                </div>
              </div>
            }
          </div>
        </DialogContent>
      </Dialog>

      {/* Export PDF */}
      <Button
        onClick={exportToPDF}
        variant="outline"
        size="sm" className="bg-orange-200 text-slate-700 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground h-8 border-white/10 hover:bg-slate-800/60">


        <Download className="w-4 h-4 mr-2" />
        Export PDF
      </Button>
    </div>);

}