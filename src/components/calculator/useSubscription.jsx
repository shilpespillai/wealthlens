import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Checks if the current user has an active premium subscription
export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const me = await base44.auth.me();
        setUser(me);
        // We store subscription status on the user object
        setIsPremium(me?.subscription_status === "active");
      } catch {
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    }
    checkSubscription();
  }, []);

  return { isPremium, loading, user };
}