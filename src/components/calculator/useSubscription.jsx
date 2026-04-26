import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// Checks if the current user has an active premium subscription
export function useSubscription() {
  const { isPaidUser, user } = useAuth();
  const [isPremiumFallback, setIsPremiumFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (isPaidUser) {
        setLoading(false);
        return;
      }
      try {
        const user = await base44.auth.me();
        
        if (user) {
          // Explicit check for admin email
          const isAdmin = user.email === 'admin@wealthlens.com';
          
          if (isAdmin) {
            setIsPremiumFallback(true);
            setLoading(false);
            return;
          }

          const response = await base44.functions.invoke("checkSubscription", {
            email: user.email,
          });

          setIsPremiumFallback(response.data.isActive);
        }
      } catch (error) {
        console.error("Subscription check failed:", error);
        setIsPremiumFallback(false);
      } finally {
        setLoading(false);
      }
    }
    checkSubscription();
  }, [isPaidUser, user]);

  return { isPremium: isPaidUser || isPremiumFallback, loading };
}