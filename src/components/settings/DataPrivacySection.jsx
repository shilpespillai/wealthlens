import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Shield, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function DataPrivacySection() {
  const [loading, setLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const handleDownloadData = async () => {
    try {
      setLoading(true);
      const calculations = await base44.entities.SavedCalculation.list();
      const data = {
        export_date: new Date().toISOString(),
        calculations: calculations
      };
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wealthlens-data-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch (error) {
      console.error("Error downloading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    try {
      setLoading(true);
      const calculations = await base44.entities.SavedCalculation.list();
      for (const calc of calculations) {
        await base44.entities.SavedCalculation.delete(calc.id);
      }
      setClearOpen(false);
    } catch (error) {
      console.error("Error clearing data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-emerald-400" />
        Data & Privacy
      </h3>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4">

        {/* Download Data */}
        <Button
          onClick={() => setExportOpen(true)}
          className="w-full bg-slate-400 text-slate-50 hover:bg-slate-500 justify-start">

          <Download className="w-4 h-4 mr-3" />
          Download Your Data (JSON)
        </Button>

        {/* Clear Data */}
        <Button
          onClick={() => setClearOpen(true)}
          className="w-full bg-slate-400 text-slate-50 hover:bg-slate-500 justify-start">

          <HardDrive className="w-4 h-4 mr-3" />
          Clear All Saved Calculations
        </Button>

        {/* Privacy Info */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-white/10 mt-6">
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-200">Privacy Policy:</strong> Your data is encrypted and stored securely. 
            We never sell or share your personal information. You have the right to request your data or delete your account at any time.
          </p>
        </div>
      </motion.div>

      {/* Download Confirmation */}
      <AlertDialog open={exportOpen} onOpenChange={setExportOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Download Your Data?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              This will download all your saved calculations as a JSON file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDownloadData}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700">

              {loading ? "Downloading..." : "Download"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Confirmation */}
      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Clear All Calculations?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              This will permanently delete all your saved calculations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700">

              {loading ? "Clearing..." : "Clear"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>);

}