import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Lock } from "lucide-react";
import { toast } from "sonner";
import { generatePdfReport } from "./generatePdfReport";

export default function SaveExport({ params, instrument, results, isPremium }) {
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
      {/* Export PDF */}
      <Button
        onClick={() => {
          if (!isPremium) return; 
          exportToPDF();
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 border-0"
      >
        {isPremium ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        Export PDF
        {!isPremium && <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded ml-1">PRO</span>}
      </Button>
    </div>
  );
}