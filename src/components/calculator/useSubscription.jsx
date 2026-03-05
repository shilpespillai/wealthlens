import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Checks if the current user has an active premium subscription
export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      try {
        // Get email from localStorage or prompt
        let email = localStorage.getItem("userEmail");

        if (!email) {
          email = prompt("Enter your email to check subscription status:");
          if (email) {
            localStorage.setItem("userEmail", email);
          }
        }

        if (email) {
          const response = await base44.functions.invoke("checkSubscription", {
            email,
          });

          setIsPremium(response.data.isActive);
        }
      } catch (error) {
        console.error("Subscription check failed:", error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    }
    checkSubscription();
  }, []);

  return { isPremium, loading };
}