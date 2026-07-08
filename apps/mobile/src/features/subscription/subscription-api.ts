import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../api/client';

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['subscription', 'status'],
    queryFn: async () => {
      const { data } = await api.get('/stripe/status');
      return data as { status: string; planTier: string; trialEndsAt: string | null; currentPeriodEnd: string | null };
    },
  });
}

export function useCheckoutSession() {
  return useMutation({
    mutationFn: async ({ plan }: { plan: 'PERSONAL' | 'FAMILY' }) => {
      const { data } = await api.post('/stripe/create-checkout-session', { plan });
      return data as { url: string };
    },
  });
}

export function usePaypalCheckoutSession() {
  return useMutation({
    mutationFn: async ({ plan }: { plan: 'PERSONAL' | 'FAMILY' }) => {
      const { data } = await api.post('/paypal/create-subscription', { plan });
      return data as { url: string };
    },
  });
}
