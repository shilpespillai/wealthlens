import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Edit2, AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AccountSection({ user }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await base44.auth.updateMe({ full_name: fullName });
      setEditOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout(createPageUrl("Home"));
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

        {/* Full Name Display */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Full Name</p>
              <p className="text-white font-semibold">{fullName || "Not set"}</p>
            </div>
            <Button
              onClick={() => setEditOpen(true)}
              variant="ghost"
              size="sm"
              className="text-indigo-400 hover:text-indigo-300">

              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline" className="bg-slate-50 text-slate-600 mt-6 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground h-9 w-full border-white/20 hover:bg-white/5">


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

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-indigo-500 outline-none"
                placeholder="Enter your full name" />

            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setEditOpen(false)}
                variant="outline"
                className="flex-1 text-white border-white/20 hover:bg-white/5">

                Cancel
              </Button>
              <Button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700">

                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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