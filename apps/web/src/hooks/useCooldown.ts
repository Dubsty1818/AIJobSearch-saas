import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage a cooldown state (e.g. for buttons to prevent spamming).
 * @param durationMs Duration in milliseconds
 */
export function useCooldown(durationMs: number = 5000) {
  const [isCooldownActive, setIsCooldownActive] = useState(false);

  const startCooldown = useCallback(() => {
    setIsCooldownActive(true);
  }, []);

  useEffect(() => {
    if (!isCooldownActive) return;
    
    const timeout = setTimeout(() => {
      setIsCooldownActive(false);
    }, durationMs);

    return () => clearTimeout(timeout);
  }, [isCooldownActive, durationMs]);

  return {
    isCooldownActive,
    startCooldown,
  };
}
