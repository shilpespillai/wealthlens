import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  DollarSign, 
  Settings, 
  ShieldCheck, 
  Zap, 
  RefreshCcw,
  Loader2,
  Crown
} from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [price, setPrice] = useState('29.99');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCurrentPrice();
  }, []);

  const fetchCurrentPrice = async () => {
    setFetching(true);
    try {
      const currentPrice = await base44.app.getPrice();
      setPrice(currentPrice.toString());
    } catch (error) {
      console.error('Failed to fetch price:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (isNaN(parseFloat(price))) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid numeric value.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await base44.app.updatePrice(parseFloat(price), user?.email);
      if (result.success) {
        toast({
          title: "Price Updated",
          description: `The premium access price has been set to $${price}.`,
        });
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.email !== 'admin@wealthlens.com') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <ShieldCheck className="w-16 h-16 text-slate-200 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Restricted Access</h2>
        <p className="text-slate-500 max-w-md">This terminal is restricted to WealthLens System Administrators only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">System Control</h1>
          <p className="text-slate-500 font-medium">Manage institutional parameters and global platform settings.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Admin Authorized</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pricing Controller */}
        <Card className="lg:col-span-2 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8 pb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <CardTitle className="text-2xl font-black flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              Platform Pricing
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium mt-2 relative z-10">
              Update the global price for Pro access across the entire network.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 -mt-6 bg-white relative z-20 rounded-t-[2.5rem]">
            <div className="space-y-8">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Active Price</p>
                  <div className="flex items-baseline gap-1">
                    {fetching ? (
                      <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                    ) : (
                      <>
                        <span className="text-4xl font-black text-slate-900">${price}</span>
                        <span className="text-xs font-bold text-slate-400">USD</span>
                      </>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={fetchCurrentPrice}
                  className="rounded-xl border-slate-200 hover:bg-white"
                >
                  <RefreshCcw className="w-4 h-4 text-slate-400" />
                </Button>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Set New Price</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <Input 
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-12 py-7 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-lg font-bold"
                      placeholder="0.00"
                    />
                  </div>
                  <Button 
                    onClick={handleUpdatePrice}
                    disabled={loading}
                    className="px-8 h-auto rounded-2xl bg-slate-900 hover:bg-black text-white font-bold"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Update"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-4">
                  <Zap className="w-5 h-5 text-emerald-500 mt-1" />
                  <div>
                    <p className="text-xs font-black text-emerald-900 mb-1">Instant Propagation</p>
                    <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">Pricing updates reflect across all checkout sessions immediately after deployment.</p>
                  </div>
                </div>
                <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-start gap-4">
                  <Crown className="w-5 h-5 text-indigo-500 mt-1" />
                  <div>
                    <p className="text-xs font-black text-indigo-900 mb-1">Lifetime Value</p>
                    <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">This price affects the one-time activation fee for all new institutional members.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <div className="space-y-8">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <Settings className="w-10 h-10 mb-6 opacity-40" />
              <h3 className="text-xl font-black mb-2">Global Registry</h3>
              <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">
                All pricing state is synchronized with the secure system gateway and mirrored in the Stripe API layer.
              </p>
              <div className="space-y-3 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="opacity-60 uppercase tracking-widest">Network Mode</span>
                  <span className="uppercase tracking-widest">Live Production</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="opacity-60 uppercase tracking-widest">API Version</span>
                  <span className="uppercase tracking-widest">v4.2.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
