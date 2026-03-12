import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Edit2, AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AccountSection({ user }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      // Delete all saved calculations first
      const calculations = await base44.entities.SavedCalculation.list();
      for (const calc of calculations) {
        await base44.entities.SavedCalculation.delete(calc.id);
      }
      // Logout after deletion
      await base44.auth.logout();
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-400" />
        Account & Profile
      </h3>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4">

        {/* Email Display */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-white/10">
          <p className="text-xs text-slate-400 mb-1">Email</p>
          <p className="text-white font-semibold">{user?.email}</p>
        </div>

        {/* Full Name removed — managed via Google profile */}

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          className="w-full mt-6 bg-slate-50 text-slate-600 hover:bg-slate-100">

          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>

        {/* Delete Account */}
        <Button
          onClick={() => setDeleteOpen(true)}
          variant="destructive"
          className="w-full mt-3">

          <AlertCircle className="w-4 h-4 mr-2" />
          Delete Account & All Data
        </Button>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              This action cannot be undone. All your data, calculations, and account information will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700">

              {loading ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>);

}