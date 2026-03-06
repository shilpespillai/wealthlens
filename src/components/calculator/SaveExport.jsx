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
    const loadingToast = toast.loading("Generating visual PDF report...");

    try {
      // Render the visual template off-screen
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.zIndex = "-1";
      document.body.appendChild(container);

      await new Promise((resolve) => {
        const root = ReactDOM.createRoot(container);
        root.render(
          <PdfReportTemplate params={params} results={results} instrument={instrument} ref={(el) => {
            if (el) {
              container._el = el;
              resolve();
            }
          }} />
        );
        // fallback resolve after short delay
        setTimeout(resolve, 1200);
      });

      // Wait a tick for recharts to paint
      await new Promise(r => setTimeout(r, 800));

      const el = container.querySelector("div");
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#0f172a",
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Investment-Report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success("Visual PDF report downloaded!");
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