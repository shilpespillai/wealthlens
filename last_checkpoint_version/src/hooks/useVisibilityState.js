import { useState, useEffect } from 'react';

/**
 * useVisibilityState
 * Optimized hook for the Page Visibility API.
 * Allows components to pause non-essential background tasks when the tab is hidden.
 */
export const useVisibilityState = () => {
  const [isVisible, setIsVisible] = useState(document.visibilityState === 'visible');

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsVisible(visible);
      
      if (visible) {
        console.log("[Visibility] Tab resumed. Resuming analytical engines.");
      } else {
        console.log("[Visibility] Tab hidden. Pausing background sync.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return isVisible;
};

export default useVisibilityState;
