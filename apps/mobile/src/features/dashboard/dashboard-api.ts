import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export interface DashboardStats {
  stats: {
    patients: number;
    appointments: number;
    medications: number;
    notes: number;
  };
  todaysTasks: {
    id: string;
    title: string;
    patientName: string;
    time: string;
    type: string;
  }[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/users/me/dashboard');
      return data?.data as DashboardStats;
    },
  });
}
