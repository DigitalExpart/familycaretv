import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { Doctor } from 'shared-types';

export function useDoctors(patientId: string) {
  return useQuery({
    queryKey: ['doctors', { patientId }],
    queryFn: async () => {
      const { data } = await api.get<Doctor[]>(`/doctors`, { params: { patientId } });
      return data;
    },
    enabled: !!patientId,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const { data } = await api.get<Doctor>(`/doctors/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newDoctor: Partial<Doctor>) => {
      const { data } = await api.post<Doctor>('/doctors', newDoctor);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', { patientId: variables.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Doctor> }) => {
      const { data } = await api.patch<Doctor>(`/doctors/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', { patientId: data.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['doctor', data.id] });
      queryClient.invalidateQueries({ queryKey: ['patients', data.patientId] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string, patientId: string }) => {
      await api.delete(`/doctors/${id}`);
      return { id, patientId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', { patientId: variables.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}
