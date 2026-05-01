import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// Checks if the current user has an active premium subscription
export function useSubscription() {
  const { isPaidUser } = useAuth();
  return { isPremium: isPaidUser, loading: false };
}