import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Save, FileText, Trash2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getCurrencySymbol } from "./CurrencySelector";

export default function SaveExport({ params, instrument, results, chartRef }) {
  const [saveName, setSaveName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: savedCalculations = [] } = useQuery({
    queryKey: ['savedCalculations'],
    queryFn: () => base44.entities.SavedCalculation.list('-created_date', 50),
  });

  const saveCalculation = useMutation({
    mutationFn: async (name) => {
      await base44.entities.SavedCalculation.create({
        name,
        instrument,
        ...params,
        finalValue: results.summary.finalPortfolioValue,
        totalReturn: results.summary.totalReturns,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCalculations'] });
      toast.success("Calculation saved successfully");
      setSaveDialogOpen(false);
      setSaveName("");
    },
  });

  const deleteCalculation = useMutation({
    mutationFn: (id) => base44.entities.SavedCalculation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCalculations'] });
      toast.success("Calculation deleted");
    },
  });

  const exportToPDF = async () => {
    toast.loading("Generating PDF report...");
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const sym = getCurrencySymbol(params.currency);
      
      // Title
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('Investment Analysis Report', pageWidth / 2, 20, { align: 'center' });
      
      // Date
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
      
      // Parameters Section
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Investment Parameters', 15, 40);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      let yPos = 50;
      const params_list = [
        `Asset Type: ${instrument.toUpperCase()}`,
        `Currency: ${params.currency}`,
        `Initial Investment: ${sym}${params.initialAmount.toLocaleString()}`,
        `Monthly Contribution: ${sym}${params.monthlyContribution.toLocaleString()}`,
        `Time Horizon: ${params.years} years`,
        `Expected Return: ${params.returnRate}%`,
        `Inflation Rate: ${params.inflationRate}%`,
        `Tax Rate: ${params.taxRate}%`,
        `Annual Fees: ${params.fees}%`,
      ];
      
      params_list.forEach(line => {
        pdf.text(line, 15, yPos);
        yPos += 6;
      });
      
      // Results Section
      yPos += 10;
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Projected Results', 15, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const results_list = [
        `Final Portfolio Value: ${sym}${results.summary.finalPortfolioValue.toLocaleString()}`,
        `Total Contributions: ${sym}${results.summary.totalContributed.toLocaleString()}`,
        `Total Returns: ${sym}${results.summary.totalReturns.toLocaleString()}`,
        `Total Return: ${results.summary.totalReturnPercent}%`,
        `Annualized Return: ${results.summary.annualizedReturn.toFixed(1)}%`,
        `Real Value (Inflation Adj.): ${sym}${results.summary.realValue.toLocaleString()}`,
        `After-Tax Value: ${sym}${results.summary.afterTaxValue.toLocaleString()}`,
      ];
      
      results_list.forEach(line => {
        pdf.text(line, 15, yPos);
        yPos += 6;
      });
      
      // Capture chart if available
      if (chartRef?.current) {
        yPos += 10;
        const canvas = await html2canvas(chartRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPos + imgHeight > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 15, yPos, imgWidth, imgHeight);
      }
      
      // Disclaimer
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Important Disclaimer', 15, 20);
      
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      const disclaimer = 'This calculator provides estimates for educational purposes only. Actual investment returns will vary based on market conditions, timing, specific instruments chosen, and other factors. Past performance does not guarantee future results. Always consult a qualified financial advisor before making investment decisions.';
      const splitDisclaimer = pdf.splitTextToSize(disclaimer, pageWidth - 30);
      pdf.text(splitDisclaimer, 15, 30);
      
      pdf.save(`Investment-Report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss();
      toast.success("PDF report downloaded");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Save Calculation */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="bg-slate-800/40 border-white/10 text-white hover:bg-slate-800/60">
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
                className="bg-slate-700/30 border-white/10 text-white mt-2"
              />
            </div>
            <Button 
              onClick={() => saveCalculation.mutate(saveName)}
              disabled={!saveName.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-500"
            >
              Save
            </Button>
            
            {/* Saved Calculations List */}
            {savedCalculations.length > 0 && (
              <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="text-sm font-semibold mb-3">Saved Calculations</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {savedCalculations.map((calc) => (
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
                        className="text-slate-400 hover:text-red-400 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Export PDF */}
      <Button 
        onClick={exportToPDF}
        variant="outline" 
        size="sm"
        className="bg-slate-800/40 border-white/10 text-white hover:bg-slate-800/60"
      >
        <Download className="w-4 h-4 mr-2" />
        Export PDF
      </Button>
    </div>
  );
}