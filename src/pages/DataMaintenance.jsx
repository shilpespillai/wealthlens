import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { 
  Cloud,
  ArrowRightLeft,
  Filter,
  Plus,
  X,
  PlusCircle,
  Building2,
  TrendingUp,
  TrendingDown,
  Layers,
  Download,
  Upload,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Loader2,
  Info,
  Settings,
  Activity,
  Database,
  Key,
  AlertTriangle,
  Clock,
  Shield,
  Crown,
  RefreshCw
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { CORE_CATEGORY_REGISTRY } from "@/utils/constants";
import { format, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import BankConnect from "@/components/calculator/BankConnect";
import SmartImporter from "@/components/SmartImporter";
import { getBasiqToken, getBasiqConnections, refreshBasiqUser } from "@/api/basiqAdapter";

export default function DataMaintenance() {
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isPurging, setIsPurging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [logs, setLogs] = useState([]);
  const [vaultStats, setVaultStats] = useState({ keys: 0, size: '0 KB', cloudKeys: '...' });
  const [bankConnections, setBankConnections] = useState([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { getClassificationRules, getDatabaseTable } = useFinancialParser();
  const { categories, addCategory, removeCategory } = useCategories(null, { global: true });
  const { masterAccounts, addAccountToMaster, deleteAccountFromMaster } = useAccounts();
  const [classificationRules, setClassificationRules] = useState(null);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');

  const addLog = (message, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), message, type, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    updateVaultStats();
    loadClassificationData();
    loadBankConnections();
  }, []);

  const loadBankConnections = async () => {
    setIsLoadingBanks(true);
    try {
      const userId = await base44.user.loadData('wl_basiq_id');
      if (!userId) {
        setIsLoadingBanks(false);
        return;
      }
      const token = await getBasiqToken('SERVER_ACCESS');
      const connections = await getBasiqConnections(token, userId);
      setBankConnections(connections);
    } catch (e) {
      console.error("Failed to load bank connections:", e);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    addLog("Requesting global bank refresh from Basiq...", "info");
    try {
      const userId = await base44.user.loadData('wl_basiq_id');
      if (!userId) throw new Error("No Basiq account linked");
      
      const token = await getBasiqToken('SERVER_ACCESS');
      await refreshBasiqUser(token, userId);
      
      addLog("Refresh command broadcasted successfully.", "success");
      toast.success("Sync Requested", { description: "Banks are now updating in the background." });
      
      // Reload connections after a short delay
      setTimeout(loadBankConnections, 3000);
    } catch (err) {
      addLog("Refresh failed: " + err.message, "error");
      toast.error("Sync Failed", { description: err.message });
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const loadClassificationData = async () => {
    const rules = await getClassificationRules();
    setClassificationRules(rules);
  };

  // Auto-save classification rules when they change and broadcast to all hook instances
  useEffect(() => {
    if (!classificationRules) return;
    
    const timer = setTimeout(async () => {
      try {
        await base44.user.saveData('wl_classification_rules', classificationRules);
        // Broadcast to all useFinancialParser instances on this page so they
        // re-load immediately — without needing a page reload.
        window.dispatchEvent(new CustomEvent('wl_rules_updated'));
      } catch (e) {
        console.error("Auto-save failed:", e);
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [classificationRules]);

  const updateRuleLogic = (type, logic) => {
    setClassificationRules(prev => ({
      ...prev,
      [type]: { ...prev[type], logic }
    }));
  };

  const addGroup = (type) => {
    const newGroup = { id: `group-${Date.now()}`, logic: 'AND', conditions: [{ field: 'category', operator: 'equals', value: '' }] };
    setClassificationRules(prev => ({
      ...prev,
      [type]: { ...prev[type], groups: [...(prev[type].groups || []), newGroup] }
    }));
  };

  const removeGroup = (type, groupIndex) => {
    setClassificationRules(prev => {
      const newGroups = prev[type].groups.filter((_, i) => i !== groupIndex);
      return { ...prev, [type]: { ...prev[type], groups: newGroups } };
    });
  };

  const updateGroupLogic = (type, groupIndex, logic) => {
    setClassificationRules(prev => {
      const newGroups = [...prev[type].groups];
      newGroups[groupIndex] = { ...newGroups[groupIndex], logic };
      return { ...prev, [type]: { ...prev[type], groups: newGroups } };
    });
  };

  const addCondition = (type, groupIndex) => {
    setClassificationRules(prev => {
      const newGroups = [...prev[type].groups];
      newGroups[groupIndex].conditions = [...newGroups[groupIndex].conditions, { field: 'category', operator: 'equals', value: '' }];
      return { ...prev, [type]: { ...prev[type], groups: newGroups } };
    });
  };

  const removeCondition = (type, groupIndex, condIndex) => {
    setClassificationRules(prev => {
      const newGroups = [...prev[type].groups];
      newGroups[groupIndex].conditions = newGroups[groupIndex].conditions.filter((_, i) => i !== condIndex);
      return { ...prev, [type]: { ...prev[type], groups: newGroups } };
    });
  };

  const updateCondition = (type, groupIndex, condIndex, field, value) => {
    setClassificationRules(prev => {
      const newGroups = [...prev[type].groups];
      newGroups[groupIndex].conditions[condIndex] = { ...newGroups[groupIndex].conditions[condIndex], [field]: value };
      if (field === 'field') newGroups[groupIndex].conditions[condIndex].value = ''; // reset value when field changes
      return { ...prev, [type]: { ...prev[type], groups: newGroups } };
    });
  };

  const updateVaultStats = async () => {
    try {
      const { session } = await base44.db._getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      // Local Stats (Only count shards for diagnostic consistency)
      let localCount = 0;
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key && key.startsWith('wl_shard_') && key.includes(userId)) {
          localCount++;
          const val = localStorage.getItem(key);
          if (val) totalSize += val.length;
        }
      }

      // Cloud Inventory (Fast count)
      const { data, count } = await supabase
        .from('wealthlens_vault')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setVaultStats({ 
        keys: localCount, 
        size: totalSize > 1024 * 1024 
          ? (totalSize / (1024 * 1024)).toFixed(2) + ' MB' 
          : (totalSize / 1024).toFixed(2) + ' KB',
        cloudKeys: count !== null ? count : '0'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const syncFromCloud = async () => {
    setIsSyncing(true);
    addLog("Initiating vault rehydration from cloud shards...", "info");
    try {
      const { session } = await base44.db._getSession();
      if (!session?.user) throw new Error("No active session");

      const { data, error } = await supabase
        .from('wealthlens_vault')
        .select('shard_key, payload')
        .eq('user_id', session.user.id);

      if (error) throw error;
      if (!data || data.length === 0) {
        addLog("No cloud shards found for this account.", "warning");
        toast.info("Cloud Vault is empty.");
        return;
      }

      addLog(`Downloading ${data.length} encrypted shards...`, "info");
      
      let importedCount = 0;
      for (const row of data) {
        const storageKey = `wl_shard_${row.shard_key}_${session.user.id}`;
        localStorage.setItem(storageKey, row.payload);
        importedCount++;
      }

      addLog(`Success. ${importedCount} shards written to Local Storage.`, "success");
      toast.success("Vault Rehydrated Locally");
      updateVaultStats();
    } catch (err) {
      console.error(err);
      addLog("Rehydration failed. Verify internet connection.", "error");
      toast.error("Rehydration Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const pushToCloud = async () => {
    setIsSyncing(true);
    addLog("Initiating full cloud synchronization...", "info");
    try {
      const { session } = await base44.db._getSession();
      if (!session?.user) throw new Error("No active session");
      const userId = session.user.id;

      const keys = Object.keys(localStorage);
      const shardsToPush = [];

      for (const key of keys) {
        if (key.startsWith('wl_shard_') && key.includes(userId)) {
          const parts = key.split('_');
          const shardKey = parts[2];
          const payload = localStorage.getItem(key);
          
          if (shardKey && payload) {
            shardsToPush.push({
              user_id: userId,
              shard_key: shardKey,
              payload: payload,
              updated_at: new Date().toISOString()
            });
          }
        }
      }

      if (shardsToPush.length === 0) {
        addLog("Zero local shards identified for synchronization.", "warning");
        toast.info("No local shards to push.");
        return;
      }

      addLog(`Uploading ${shardsToPush.length} encrypted shards to cloud...`, "info");
      console.log(`[Vault Push] Preparing to upsert ${shardsToPush.length} shards:`, shardsToPush.map(s => s.shard_key));
      
      const { error } = await supabase
        .from('wealthlens_vault')
        .upsert(shardsToPush, { onConflict: 'user_id,shard_key' });

      if (error) throw error;

      addLog(`Success. ${shardsToPush.length} shards mirrored to cloud.`, "success");
      toast.success("Cloud Vault Synchronized");
      updateVaultStats();
    } catch (err) {
      console.error(err);
      addLog("Cloud push failed. Verify internet connection.", "error");
      toast.error("Cloud Push Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const runKeyDiagnostics = async () => {
    try {
      const { session } = await base44.db._getSession();
      const userId = session?.user?.id;
      console.log("--- VAULT KEY DIAGNOSTICS ---");
      console.log("Active Session User ID:", userId);
      
      const allKeys = Object.keys(localStorage);
      console.log("Total LocalStorage Keys:", allKeys.length);
      
      const wlKeys = allKeys.filter(k => k.startsWith('wl_'));
      console.log("WealthLens (wl_*) Keys:", wlKeys);
      
      const userSpecificKeys = allKeys.filter(k => userId && k.includes(userId));
      console.log(`Keys matching Current User (${userId}):`, userSpecificKeys);
      
      if (wlKeys.length > 0 && userSpecificKeys.length === 0) {
        console.warn("CRITICAL: WealthLens data found, but none matches the current User ID. Possible session mismatch.");
      }
      
      toast.info(`Diagnostics complete. Found ${wlKeys.length} total WealthLens keys.`);
      addLog("Key diagnostics performed. Check console.", "info");
    } catch (e) {
      console.error(e);
    }
  };

  const handlePurge = async () => {
    if (confirmText !== 'PURGE') {
      toast.error("Security verification failed. Please type 'PURGE'.");
      return;
    }

    setIsPurging(true);
    addLog(`Initiating bulk transaction purge: ${startDate} to ${endDate}...`, "warning");
    
    try {
      const allTransactions = await base44.db.getTable('transactions');
      const start = new Date(startDate);
      const end = new Date(endDate);

      const toDelete = (allTransactions || []).filter(tx => {
        const txDate = new Date(tx.date || tx.actualDate);
        if (isNaN(txDate.getTime())) return false;
        return txDate >= start && txDate <= end;
      });

      if (toDelete.length === 0) {
        addLog("Zero records identified for deletion in the selected range.", "info");
        setIsPurging(false);
        return;
      }

      const shardsToUpdate = {};
      for (const tx of toDelete) {
        const shardKey = base44.db._getShardKey(tx.date || tx.actualDate);
        if (!shardsToUpdate[shardKey]) shardsToUpdate[shardKey] = [];
        shardsToUpdate[shardKey].push(tx.id);
      }

      const shardKeys = Object.keys(shardsToUpdate);
      addLog(`Optimizing purge across ${shardKeys.length} shards...`, "info");

      for (const shardKey of shardKeys) {
        const shard = await base44.db._loadShard(shardKey);
        if (shard && shard.transactions) {
          const idsToRemove = new Set(shardsToUpdate[shardKey].map(String));
          const originalCount = shard.transactions.length;
          shard.transactions = shard.transactions.filter(tx => !idsToRemove.has(String(tx.id)));
          if (shard.transactions.length !== originalCount) {
            await base44.db._saveShard(shardKey, shard);
            addLog(`Shard ${shardKey}: Purged ${originalCount - shard.transactions.length} items.`, "info");
          }
        }
      }

      addLog(`Purge operation successful. Removed ${toDelete.length} records.`, "success");
      toast.success(`Successfully purged ${toDelete.length} transactions.`);
      setConfirmText('');
      updateVaultStats();
    } catch (err) {
      addLog("Critical failure during purge execution.", "error");
      toast.error("Operation failed. System integrity maintained.");
    } finally {
      setIsPurging(false);
    }
  };

  const handleResetSystem = async () => {
    const confirmed = window.confirm(
      "CRITICAL: This will perform a FULL FACTORY RESET.\n\n" +
      "1. All local encrypted shards will be DELETED.\n" +
      "2. All session keys and preferences will be CLEARED.\n" +
      "3. You will be logged out immediately.\n\n" +
      "Ensure you have a .wealth backup. Proceed?"
    );

    if (!confirmed) return;

    addLog("Initiating full system wipe...", "warning");
    try {
      // Clear all WealthLens data
      localStorage.clear();
      addLog("Local Storage wiped.", "success");
      toast.success("System Reset Complete");
      
      // Redirect to landing/login
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      console.error("Reset failed:", err);
      toast.error("System reset encountered an error.");
    }
  };
 
  const { isPaidUser } = useAuth();
  const [syncEnabled, setSyncEnabled] = useState(true);

  useEffect(() => {
    const checkSync = async () => {
      const enabled = await base44.user.loadData('wl_cloud_sync_enabled');
      setSyncEnabled(enabled !== false);
    };
    checkSync();
  }, []);

  const exportVault = async () => {
    try {
      addLog("Preparing vault export package...", "info");
      const { session } = await base44.db._getSession();
      
      if (!session?.user) {
        toast.error("Authentication required for export.");
        return;
      }
      
      const userId = session.user.id;
      const backup = { 
        version: "1.0", 
        export_date: new Date().toISOString(), 
        user_id: userId, 
        shards: {} 
      };
      
      const keys = Object.keys(localStorage);
      let foundCount = 0;

      for (const key of keys) {
        if (key && (key.includes(userId) || (key.startsWith('wl_') && key.includes('shard'))) && !key.startsWith('sb-')) {
          backup.shards[key] = localStorage.getItem(key);
          foundCount++;
        }
      }

      console.log(`[Vault Export] Scan complete. Found ${foundCount} keys for User ID: ${userId}`);

      if (foundCount === 0) {
        toast.error("No local data identified. Try 'Pull from Cloud' first.");
        addLog("Export failed: 0 keys identified.", "error");
        return;
      }

      addLog(`Packaging ${foundCount} clusters...`, "info");
      
      // Institutional Obfuscation: Wrap in Base64 to prevent plain-text inspection of UserIDs/Keys
      const json = JSON.stringify(backup);
      const obfuscated = btoa(unescape(encodeURIComponent(json)));
      
      const blob = new Blob([obfuscated], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const localDate = new Date();
      const dateStr = `${localDate.getFullYear()}-${(localDate.getMonth() + 1).toString().padStart(2, '0')}-${localDate.getDate().toString().padStart(2, '0')}`;
      link.download = `wealthlens_vault_${dateStr}.wealth`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addLog("Vault export successful.", "success");
      toast.success(`Exported ${foundCount} clusters successfully.`);
    } catch (e) {
      console.error("[Vault Export] Critical Error:", e);
      addLog("Export engine failed.", "error");
      toast.error("Critical failure during export.");
    }
  };

  const importVault = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        let content = e.target.result;
        let backup;

        // Try to decode Base64 obfuscation first
        try {
          const decoded = decodeURIComponent(escape(atob(content)));
          backup = JSON.parse(decoded);
          console.log("[Vault Import] Decoded obfuscated format.");
        } catch (b64Err) {
          // Fallback to plain JSON for legacy support
          backup = JSON.parse(content);
          console.log("[Vault Import] Falling back to legacy JSON format.");
        }

        if (!backup || !backup.shards) throw new Error("Invalid format");
        
        const count = Object.keys(backup.shards).length;
        Object.entries(backup.shards).forEach(([key, val]) => {
          localStorage.setItem(key, val);
        });
        
        toast.success(`Vault Restored: ${count} clusters imported. Refreshing...`);
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast.error("Import failed: Invalid vault file");
      }
    };
    reader.readAsText(file);
  };

  const toggleSync = async () => {
    const newVal = !syncEnabled;
    await base44.user.saveData('wl_cloud_sync_enabled', newVal);
    setSyncEnabled(newVal);
    toast.success(newVal ? "Cloud Sync Enabled" : "Cloud Sync Disabled (Local-Only Mode)");
  };

  if (!isPaidUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl text-center relative overflow-hidden border border-slate-100"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 relative z-10 border border-amber-100 shadow-inner">
            <Crown className="w-10 h-10 text-amber-500 fill-amber-500/10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Wealthlens <span className="text-slate-400">Pro</span></h2>
          <p className="text-sm text-slate-500 font-medium mb-10 max-w-xs mx-auto leading-relaxed">
            Elite data lifecycle tools and zero-knowledge cloud mirroring for institutional-grade financial sovereignty.
          </p>
          <div className="grid grid-cols-1 gap-3 text-left mb-10 relative z-10">
             {[
               { icon: Zap, label: "Cross-Device Sync", color: "text-emerald-500" },
               { icon: ShieldCheck, label: "Automated Backups", color: "text-indigo-500" },
               { icon: Trash2, label: "Advanced Purge", color: "text-rose-500" },
               { icon: Download, label: "Vault Portability", color: "text-amber-500" }
             ].map((feat, i) => (
               <div key={i} className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <feat.icon className={`w-5 h-5 ${feat.color}`} />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">{feat.label}</span>
               </div>
             ))}
          </div>
          <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
            Unlock Wealthlens Pro
          </Button>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 md:p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">System Mode</span>
               <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                 syncEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
               }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${syncEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                  {syncEnabled ? 'Live Sync' : 'Local Only'}
               </div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Data Management <span className="text-slate-400">Hub</span></h1>
            <p className="text-slate-500 font-medium max-w-lg">Advanced structural cleanup, bank connectivity, and data lifecycle management console.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 px-4 border-r border-slate-100 shrink-0">
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Vault</span>
                <span className="text-xs font-black uppercase text-emerald-600">Locked</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Enc</span>
                <span className="text-xs font-black uppercase text-indigo-600">AES-256</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={exportVault} className="h-12 px-4 rounded-2xl hover:bg-slate-50 flex items-center gap-2 group transition-all">
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest">Export</span>
              </Button>

              <label className="cursor-pointer">
                <div className="h-12 px-4 rounded-2xl hover:bg-slate-50 flex items-center gap-2 group transition-all">
                  <Upload className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Import</span>
                  <input type="file" className="hidden" onChange={importVault} accept=".wealth,application/json" />
                </div>
              </label>

              <Button onClick={toggleSync} className={`h-12 px-6 rounded-2xl transition-all flex items-center gap-3 ${
                syncEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
              }`}>
                 {syncEnabled ? <Zap className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                 <span className="text-[10px] font-black uppercase tracking-widest">{syncEnabled ? 'Cloud sync on' : 'Cloud sync off'}</span>
              </Button>

              <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                 <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* INSTITUTIONAL CONNECTIVITY */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100/50 overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Institutional Connectivity</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Global bank data aggregation & sync management</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <Button 
                 onClick={handleRefreshAll}
                 disabled={isRefreshingAll || bankConnections.length === 0}
                 variant="outline"
                 className="h-12 px-6 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all gap-2"
               >
                 {isRefreshingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-emerald-500" />}
                 Sync All Banks
               </Button>

               <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="relative overflow-hidden group transition-all duration-500 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 rounded-2xl shadow-lg shadow-orange-500/20 border-t border-white/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="flex items-center gap-2 relative z-10">
                        <Download className="w-4 h-4 text-orange-200" />
                        Import (CSV/PDF)
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black tracking-tighter">Institutional Data Importer</DialogTitle>
                    </DialogHeader>
                    <SmartImporter 
                      accounts={masterAccounts}
                      onComplete={() => {
                        setIsImportModalOpen(false);
                        toast.success("Import successful");
                        updateVaultStats();
                      }} 
                      onCancel={() => setIsImportModalOpen(false)}
                    />
                  </DialogContent>
               </Dialog>

               <BankConnect onSyncSuccess={() => {
                 toast.success("Connection established");
                 loadBankConnections();
               }} className="h-12 px-8 bg-slate-900 hover:bg-black text-white rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200" />
            </div>
          </CardHeader>
          
          <CardContent className="p-8 bg-slate-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingBanks ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                ))
              ) : bankConnections.length > 0 ? (
                bankConnections.map((conn) => (
                  <motion.div 
                    key={conn.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                          <Building2 className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{conn.institution.name}</h4>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Connection ID: {conn.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                      <Badge className={`rounded-full px-2 py-0 text-[8px] font-black uppercase tracking-tighter ${
                        conn.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {conn.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                       <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">
                            Refreshed: {conn.lastSynced ? format(new Date(conn.lastSynced), 'MMM dd, HH:mm') : 'Pending'}
                          </span>
                       </div>
                       <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-50 text-slate-300 hover:text-slate-900">
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                       </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="lg:col-span-3 py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Database className="w-8 h-8 text-slate-200" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">No active connections</h4>
                    <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mt-1">Connect your first bank to begin secure, automated financial data aggregation.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TOP TOOLS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100/50">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-black uppercase flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                Bulk Purge
              </CardTitle>
              <div className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-widest border border-rose-100 animate-pulse">Danger Zone</div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col sm:flex-row gap-6 max-w-2xl">
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 text-sm font-bold focus:bg-white transition-all" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 text-sm font-bold focus:bg-white transition-all" />
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-start gap-4">
                <Info className="w-5 h-5 text-slate-400 mt-1" />
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider">Shard-Aware Processing</span>
                  This operation optimizes your vault by grouping transaction removal by month. This reduces encryption overhead by 95% and ensures near-instant performance.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4 pt-2">
                 <div className="flex flex-col items-end gap-1.5">
                   <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-4">Security Verification</Label>
                   <Input 
                     value={confirmText} 
                     onChange={(e) => setConfirmText(e.target.value)} 
                     placeholder="Type 'PURGE' to verify" 
                     className="h-12 w-[220px] rounded-2xl text-xs font-black uppercase tracking-widest text-center border-rose-100 focus:border-rose-300 focus:ring-rose-100 transition-all"
                   />
                 </div>
                 <Button 
                   onClick={handlePurge} 
                   disabled={isPurging || confirmText !== 'PURGE'} 
                   className="h-12 px-10 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-600/20 transition-all flex items-center gap-3 disabled:opacity-50"
                 >
                   {isPurging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                   Execute Bulk Purge
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col gap-4">
               <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                     <Settings className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">System Sync</h3>
               </div>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Advanced maintenance tools for vault integrity and cloud synchronization state.
               </p>
               <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      await updateVaultStats();
                      toast.success("Integrity Check Complete");
                    }}
                    className="h-10 rounded-xl border-slate-200 text-[8px] font-black uppercase tracking-widest hover:bg-white transition-all gap-2"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Integrity Check
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={pushToCloud}
                    disabled={isSyncing}
                    className="h-10 rounded-xl border-slate-200 text-[8px] font-black uppercase tracking-widest hover:bg-white transition-all"
                  >
                    {isSyncing ? "Syncing..." : "Force Sync"}
                  </Button>
               </div>

            </div>

            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden">
               <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
                     Vault Statistics
                     <Activity className="w-3 h-3" />
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 pt-0 space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] text-slate-500 font-medium uppercase">Active Clusters</span>
                     <span className="text-xs font-black text-slate-900">{vaultStats.keys}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] text-slate-500 font-medium uppercase">Cloud Clusters</span>
                     <span className="text-xs font-black text-slate-600">{vaultStats.cloudKeys}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] text-slate-500 font-medium uppercase">Local Footprint</span>
                     <span className="text-xs font-black text-emerald-600">{vaultStats.size}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium pt-2 border-t border-slate-50">
                    Wealthlens uses <span className="text-slate-900 font-bold">Zero-Knowledge</span> mirroring. Your data remains encrypted even when synced to our servers.
                  </p>
               </CardContent>
            </Card>
          </div>
        </div>

        {/* DYNAMIC CLASSIFICATION ENGINE */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-slate-50/50 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          
          <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between space-y-0 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Classification <span className="text-slate-400">Engine</span></CardTitle>
                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global logic overrides for income and expense detection</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 relative z-10">
            {!classificationRules ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest">Hydrating rule set...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {(() => {
                  const renderRuleBlock = (type, title, Icon, colorClass, bgClass) => {
                    const ruleObj = classificationRules[type];
                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl ${bgClass} flex items-center justify-center ${colorClass}`}>
                                 <Icon className="w-4 h-4" />
                              </div>
                              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">{title}</h3>
                           </div>
                           <Select value={ruleObj.logic} onValueChange={(v) => updateRuleLogic(type, v)}>
                             <SelectTrigger className="w-36 h-8 rounded-lg border-slate-100 text-[10px] font-black uppercase bg-slate-50">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="OR" className="text-[10px] font-black uppercase">Match ANY Group</SelectItem>
                               <SelectItem value="AND" className="text-[10px] font-black uppercase">Match ALL Groups</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>

                        <div className="space-y-6">
                          {ruleObj.groups.map((group, gIdx) => (
                            <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-slate-100" />
                              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Group Logic:</span>
                                  <Select value={group.logic} onValueChange={(v) => updateGroupLogic(type, gIdx, v)}>
                                    <SelectTrigger className="w-32 h-8 rounded-lg border-slate-100 text-[10px] font-black uppercase bg-slate-50">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="OR" className="text-[10px] font-black uppercase">Match ANY (OR)</SelectItem>
                                      <SelectItem value="AND" className="text-[10px] font-black uppercase">Match ALL (AND)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeGroup(type, gIdx)} className="w-8 h-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-3">
                                {group.conditions.map((cond, cIdx) => (
                                  <div key={cIdx} className="flex items-center gap-2">
                                    <Select value={cond.field} onValueChange={(v) => updateCondition(type, gIdx, cIdx, 'field', v)}>
                                      <SelectTrigger className="w-28 h-10 rounded-xl bg-slate-50 border-slate-100 text-[10px] font-bold uppercase">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="category" className="text-[10px] font-bold uppercase">Category</SelectItem>
                                        <SelectItem value="account" className="text-[10px] font-bold uppercase">Account</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <Select value={cond.operator} onValueChange={(v) => updateCondition(type, gIdx, cIdx, 'operator', v)}>
                                      <SelectTrigger className="w-32 h-10 rounded-xl bg-slate-50 border-slate-100 text-[10px] font-bold uppercase">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="equals" className="text-[10px] font-bold uppercase">Equals</SelectItem>
                                        <SelectItem value="not_equals" className="text-[10px] font-bold uppercase">Not Equals</SelectItem>
                                        <SelectItem value="contains" className="text-[10px] font-bold uppercase">Contains</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <div className="flex-1">
                                      {cond.field === 'category' ? (
                                        <Select value={cond.value} onValueChange={(v) => updateCondition(type, gIdx, cIdx, 'value', v)}>
                                          <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-slate-100 text-[10px] font-bold uppercase">
                                            <SelectValue placeholder="Select Category" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {categories.map(c => <SelectItem key={c.name} value={c.name} className="text-[10px] font-bold uppercase">{c.name}</SelectItem>)}
                                          </SelectContent>
                                        </Select>
                                      ) : cond.field === 'account' ? (
                                        <Select value={cond.value} onValueChange={(v) => updateCondition(type, gIdx, cIdx, 'value', v)}>
                                          <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-slate-100 text-[10px] font-bold uppercase">
                                            <SelectValue placeholder="Select Account" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {masterAccounts.map(a => <SelectItem key={a.id} value={String(a.id)} className="text-[10px] font-bold uppercase">{a.name}</SelectItem>)}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Input value={cond.value} onChange={(e) => updateCondition(type, gIdx, cIdx, 'value', e.target.value)} className="h-10 rounded-xl bg-slate-50 border-slate-100 text-xs font-bold" placeholder="Description contains..." />
                                      )}
                                    </div>
                                    
                                    <Button variant="ghost" size="icon" onClick={() => removeCondition(type, gIdx, cIdx)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button variant="ghost" onClick={() => addCondition(type, gIdx)} className="w-full h-10 mt-2 border-dashed border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                                  <Plus className="w-3 h-3 mr-2" /> Add Condition
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                          
                          {ruleObj.groups.length === 0 && (
                            <div className="h-32 rounded-3xl border border-slate-100 border-dashed flex items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                               No active groups
                            </div>
                          )}

                          <Button variant="outline" onClick={() => addGroup(type)} className="w-full h-12 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 shadow-sm transition-all group">
                            <Layers className="w-4 h-4 mr-2 text-slate-400 group-hover:text-slate-700 transition-colors" /> Add Logic Group
                          </Button>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <>
                      {renderRuleBlock('income', 'Income Classification', TrendingUp, 'text-emerald-600', 'bg-emerald-50')}
                      {renderRuleBlock('expense', 'Expense Classification', TrendingDown, 'text-rose-600', 'bg-rose-50')}
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CATEGORY REGISTRY MANAGER */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100/50 overflow-hidden relative mb-8">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50/20 rounded-full blur-[100px] -ml-48 -mb-48"></div>
          
          <CardHeader className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/10">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Category <span className="text-slate-400">Registry</span></CardTitle>
                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage global financial taxonomy and propagation baseline</CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <Input 
                 placeholder="New category name..." 
                 id="new-category-input"
                 className="h-12 w-64 rounded-2xl border-slate-100 bg-slate-50/50 text-xs font-bold focus:bg-white transition-all px-6"
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     const val = e.currentTarget.value;
                     if (val) {
                       addCategory(val);
                       e.currentTarget.value = '';
                     }
                   }
                 }}
               />
               <Button 
                onClick={() => {
                  const input = document.getElementById('new-category-input');
                  if (input && input.value) {
                    addCategory(input.value);
                    input.value = '';
                  }
                }}
                className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
               >
                 <PlusCircle className="w-4 h-4" />
                 Register
               </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <AnimatePresence>
                {categories.map((cat, i) => {
                  const isCore = CORE_CATEGORY_REGISTRY.some(c => c.name.toLowerCase() === cat.name.toLowerCase());
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={cat.name}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${cat.type === 'income' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 truncate">{cat.name}</span>
                      </div>
                      
                      {!isCore ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeCategory(cat.name)}
                          className="w-6 h-6 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-slate-200 group-hover:text-slate-400 transition-colors mr-1" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* ACCOUNT REPOSITORY */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8">
            <div className="w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
          </div>
          
          <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-600/10">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Account <span className="text-slate-400">Repository</span></CardTitle>
                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Master registry for global account distribution</CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <Input 
                 placeholder="New account name..." 
                 id="new-account-input"
                 className="h-12 w-64 rounded-2xl border-slate-100 bg-slate-50/50 text-xs font-bold focus:bg-white transition-all px-6"
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     const val = e.currentTarget.value;
                     if (val) {
                        addAccountToMaster({ name: val, type: 'asset', base_balance: 0 });
                        e.currentTarget.value = '';
                     }
                   }
                 }}
               />
               <Button 
                onClick={() => {
                  const input = document.getElementById('new-account-input');
                  if (input && input.value) {
                    addAccountToMaster({ name: input.value, type: 'asset', base_balance: 0 });
                    input.value = '';
                  }
                }}
                className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
               >
                 <PlusCircle className="w-4 h-4" />
                 Register
               </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <AnimatePresence>
                {masterAccounts.map((acc, i) => {
                  const isSystem = acc.is_system;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={acc.id}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${acc.type === 'debt' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 truncate">{acc.name}</span>
                      </div>
                      
                      {!isSystem ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteAccountFromMaster(acc.id)}
                          className="w-6 h-6 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-slate-200 group-hover:text-slate-400 transition-colors mr-1" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* DOCUMENTATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden">
            <CardHeader className="p-8 pb-3">
              <CardTitle className="text-[11px] font-black flex items-center gap-3 uppercase tracking-widest text-slate-400">
                <Database className="w-4 h-4 text-emerald-500" />
                Storage & Sync Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-slate-400" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase text-slate-900">Local-First Encryption</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Transactions are encrypted with AES-256 before leaving your device.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <Cloud className="w-5 h-5 text-slate-400" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase text-slate-900">Mirror Synchronization</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Encrypted shards are mirrored across clusters for multi-device access.</p>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden">
            <CardHeader className="p-8 pb-3">
              <CardTitle className="text-[11px] font-black flex items-center gap-3 uppercase tracking-widest text-slate-400">
                <Clock className="w-4 h-4 text-indigo-500" />
                Maintenance Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <Key className="w-5 h-5 text-slate-400" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase text-slate-900">Entropy Rotation</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Session keys are rotated every 24 hours to ensure forward secrecy.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-slate-400" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase text-slate-900">Zero-Recovery Protocol</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">We cannot recover your data if your local master key is lost.</p>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* VAULT PORTABILITY SECTION (Bottom-most) */}
        <div className="pt-8 border-t border-slate-100">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Export (Self-Custody)</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Creates a <span className="font-bold text-slate-900">100% encrypted .wealth</span> bundle. This unreadable backup is safe to store on hardware, ensuring you always own your data.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Import (Secure Restoration)</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Instantly restores your history from an encrypted backup. The system performs an automatic refresh to ensure all financial modules and balances reflect the new data immediately.</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
