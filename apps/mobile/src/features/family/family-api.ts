import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

export interface FamilyMember {
  id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  inviteCode?: string;
  createdAt: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface FamilyData {
  isOwner: boolean;
  isMember: boolean;
  members: FamilyMember[];
  familyOwner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export function useMyFamily() {
  return useQuery({
    queryKey: ['family'],
    queryFn: async () => {
      const { data } = await api.get('/family');
      return data as FamilyData;
    },
  });
}

export function useInviteFamilyMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/family/invite', { email });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
    },
  });
}

export function useRemoveFamilyMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/family/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
    },
  });
}
