import React, { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const SHORTCUTS = [
  { keys: "Cmd/Ctrl + S", description: "Save current calculation" },
  { keys: "Cmd/Ctrl + E", description: "Export as PDF" },
  { keys: "Cmd/Ctrl + /", description: "Open settings" },
  { keys: "Esc", description: "Close dialogs" },
  { keys: "Enter", description: "Submit form" },
  { keys: "Tab", description: "Navigate inputs" },
];

export default function AppSettingsSection() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);
      // Clear localStorage
      const keysToPreserve = ["wealthlens-theme"];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToPreserve.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      // Force refresh
      window.location.reload();
    } catch (error) {
      console.error("Error resetting app:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <RotateCcw className="w-5 h-5 text-violet-400" />
        App Settings
      </h3>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {/* Keyboard Shortcuts */}
        <Button
          onClick={() => setShortcutsOpen(true)}
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/5 justify-start"
        >
          <Keyboard className="w-4 h-4 mr-3" />
          View Keyboard Shortcuts
        </Button>

        {/* Reset App */}
        <Button
          onClick={() => setResetOpen(true)}
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/5 justify-start"
        >
          <RotateCcw className="w-4 h-4 mr-3" />
          Reset All Settings & Cache
        </Button>

        <div className="bg-slate-800/30 rounded-xl p-4 border border-white/10 mt-6">
          <p className="text-xs text-slate-300">
            <strong className="text-slate-200">Version:</strong> 1.0.0
          </p>
        </div>
      </motion.div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="bg-slate-900 border-white/10 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-violet-400" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {SHORTCUTS.map((shortcut, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3 border border-white/10"
              >
                <span className="text-slate-300">{shortcut.description}</span>
                <code className="bg-slate-700 text-indigo-300 px-3 py-1 rounded text-sm font-mono">
                  {shortcut.keys}
                </code>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Reset All Settings?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              This will clear your app cache and reset all settings to defaults. Your saved calculations will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading ? "Resetting..." : "Reset"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}