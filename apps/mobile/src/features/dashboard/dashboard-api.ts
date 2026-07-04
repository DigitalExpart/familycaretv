import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export interface DashboardStats {
  stats: {
    patients: number;
    appointments: number;
    medications: number;
    notes: number;
    kids: number;
    pets: number;
    books?: number;
    music?: number;
  };
  todaysTasks: {
    id: string;
    title: string;
    patientName: string;
    time: string;
    type: string;
  }[];
  dailyTasks: {
    id: string;
    title: string;
    category: string;
    completed: boolean;
  }[];
  verseOfTheDay?: {
    id: string;
    verse: string;
    reference: string;
  };
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
