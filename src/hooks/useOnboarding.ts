'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

export interface OnboardingStatus {
  hasWhatsApp: boolean;
  hasProperties: boolean;
  hasContacts: boolean;
}

function dismissedKey(accountId: string) {
  return `onboarding_dismissed_${accountId}`;
}

export function useOnboarding() {
  const { profile } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const accountId = profile?.account_id as string | undefined;

  // Check localStorage for dismissed state once account is known
  useEffect(() => {
    if (!accountId) return;
    const key = dismissedKey(accountId);
    setDismissed(localStorage.getItem(key) === 'true');
  }, [accountId]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/onboarding/status');
      if (!res.ok) return;
      const data: OnboardingStatus = await res.json();
      setStatus(data);
    } catch {
      // Non-critical — fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accountId) refresh();
  }, [accountId, refresh]);

  function dismiss() {
    if (!accountId) return;
    localStorage.setItem(dismissedKey(accountId), 'true');
    setDismissed(true);
  }

  const allDone = status
    ? status.hasWhatsApp && status.hasProperties && status.hasContacts
    : false;

  // Show wizard when: not dismissed, not loading, and at least one step incomplete
  const shouldShow = !loading && !dismissed && !!status && !allDone;

  return { status, loading, dismissed, shouldShow, allDone, refresh, dismiss };
}
