import React, { useState, useEffect } from 'react';
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
  Crown,
  Heart,
  MessageCircle,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wand2
} from 'lucide-react';
import { base44, invokeUniversalAI } from '@/api/base44Client';

import { INITIAL_TESTIMONIALS } from './TestimonialsPage';

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [price, setPrice] = useState('29.99');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [savingTestimonial, setSavingTestimonial] = useState(null);
  const [draftingAI, setDraftingAI] = useState(null);
  const [launchConfig, setLaunchConfig] = useState({ code: '', expiry: '' });
  const [savingLaunch, setSavingLaunch] = useState(false);

  useEffect(() => {
    fetchCurrentPrice();
    fetchTestimonials();
    fetchLaunchConfig();
  }, []);

  const fetchLaunchConfig = async () => {
    try {
      const stored = await base44.user.loadData('wl_public_launch_config');
      if (stored) setLaunchConfig(stored);
    } catch (e) {
      console.error("Failed to fetch launch config:", e);
    }
  };

  const saveLaunchConfig = async () => {
    setSavingLaunch(true);
    try {
      await base44.user.saveData('wl_public_launch_config', launchConfig);
      toast({
        title: "Launch Protocol Updated",
        description: `The code "${launchConfig.code}" is now live until ${launchConfig.expiry}.`,
      });
    } catch (e) {
      toast({
        title: "Update Failed",
        description: "Could not sync launch configuration.",
        variant: "destructive"
      });
    } finally {
      setSavingLaunch(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const stored = await base44.user.loadData('wl_public_testimonials') || [];
      
      // Merge initial ones with stored ones
      const merged = [...stored];
      INITIAL_TESTIMONIALS.forEach(initial => {
        if (!merged.find(m => m.id === initial.id)) {
          merged.push(initial);
        }
      });
      
      setTestimonials(merged);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      // Fallback to initial if DB fails
      setTestimonials(INITIAL_TESTIMONIALS);
    }
  };

  const handleUpdateReply = (id, newReply) => {
    setTestimonials(prev => prev.map(t => 
      t.id === id ? { ...t, reply: newReply } : t
    ));
  };

  const saveTestimonialResponse = async (id) => {
    setSavingTestimonial(id);
    try {
      await base44.user.saveData('wl_public_testimonials', testimonials);
      toast({
        title: "Response Transmitted",
        description: "Your reply has been broadcast to the Testimonials wall.",
      });
    } catch (error) {
      toast({
        title: "Transmission Failed",
        description: "Error saving to institutional vault.",
        variant: "destructive"
      });
    } finally {
      setSavingTestimonial(null);
    }
  };

  const generateAIResponse = async (id, quote) => {
    setDraftingAI(id);
    try {
      const prompt = `Act as the WealthLens institutional support team. Write a professional, encouraging, and elite 2-sentence response to this investor testimonial: "${quote}". The tone should be institutional, minimalist, and forward-looking.`;
      const response = await invokeUniversalAI(prompt, 'coach');
      const text = response?.assessment || response?.reply || response?.markdownContent || "Thank you for your valuable feedback. We are honored to support your financial journey.";
      
      handleUpdateReply(id, text);
      toast({
        title: "AI Draft Generated",
        description: "The Intelligence Engine has prepared a context-aware response.",
      });
    } catch (error) {
      console.error("AI Draft failed:", error);
      toast({
        title: "AI Engine Offline",
        description: "Falling back to standard protocol response.",
        variant: "destructive"
      });
    } finally {
      setDraftingAI(null);
    }
  };

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

              {/* Launch Control Segment */}
              <div className="pt-8 border-t border-slate-100 mt-8 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center border border-pink-100">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                   </div>
                   <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Community Launch Protocol</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Master Launch Code</label>
                      <Input 
                        value={launchConfig.code}
                        onChange={(e) => setLaunchConfig(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-black tracking-[0.2em] uppercase focus:bg-white transition-all"
                        placeholder="E.G. WEALTH2026"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Global Expiry Date</label>
                      <Input 
                        type="date"
                        value={launchConfig.expiry}
                        onChange={(e) => setLaunchConfig(prev => ({ ...prev, expiry: e.target.value }))}
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold focus:bg-white transition-all"
                      />
                   </div>
                </div>

                <Button 
                  onClick={saveLaunchConfig}
                  disabled={savingLaunch}
                  className="w-full md:w-auto px-10 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200"
                >
                  {savingLaunch ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Launch Settings"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
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

      {/* Testimonials Moderation Hub */}
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-8 pb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <CardTitle className="text-2xl font-black flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Heart className="w-5 h-5 text-white" />
            </div>
            Community Voice Moderation
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium mt-2 relative z-10">
            Monitor incoming testimonials and respond with WealthLens institutional guidance.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 -mt-6 bg-white relative z-20 rounded-t-[2.5rem]">
          {testimonials.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
               <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No transmissions detected in vault</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6 hover:border-indigo-100 transition-colors flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white font-black shadow-md`}>
                          {t.avatar}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</p>
                        </div>
                      </div>
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
                        {t.id}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 italic text-slate-600 text-sm font-medium leading-relaxed">
                      "{t.quote}"
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-slate-200/50">
                    <div className="flex items-center justify-between ml-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Response</label>
                       {t.reply && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <div className="flex gap-4">
                      <textarea 
                        value={t.reply}
                        onChange={(e) => handleUpdateReply(t.id, e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none h-24"
                        placeholder="Draft the team response..."
                      />
                      <Button 
                        variant="outline"
                        disabled={draftingAI === t.id}
                        onClick={() => generateAIResponse(t.id, t.quote)}
                        className="h-24 px-4 rounded-2xl border-slate-200 hover:border-indigo-500 text-indigo-600 font-black uppercase tracking-widest text-[8px] flex-col gap-2"
                      >
                        {draftingAI === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        Smart Draft
                      </Button>
                      <Button 
                        disabled={savingTestimonial === t.id}
                        onClick={() => saveTestimonialResponse(t.id)}
                        className="h-24 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[8px] flex-col gap-2"
                      >
                        {savingTestimonial === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Broadcast
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
