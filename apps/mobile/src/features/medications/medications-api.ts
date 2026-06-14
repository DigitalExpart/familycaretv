import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { Medication, MedicationLookupResponse } from 'shared-types';

export function useMedications(patientId: string) {
  return useQuery({
    queryKey: ['medications', { patientId }],
    queryFn: async () => {
      const { data } = await api.get<Medication[]>(`/medications`, { params: { patientId } });
      return data;
    },
    enabled: !!patientId,
  });
}

export function useMedication(id: string) {
  return useQuery({
    queryKey: ['medication', id],
    queryFn: async () => {
      const { data } = await api.get<Medication>(`/medications/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newMedication: Partial<Medication>) => {
      const { data } = await api.post<Medication>('/medications', newMedication);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', { patientId: variables.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Medication> }) => {
      const { data } = await api.patch<Medication>(`/medications/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medications', { patientId: data.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['medication', data.id] });
      queryClient.invalidateQueries({ queryKey: ['patients', data.patientId] });
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string, patientId: string }) => {
      await api.delete(`/medications/${id}`);
      return { id, patientId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', { patientId: variables.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}

export function useLookupMedication() {
  return useMutation({
    mutationFn: async ({ medication, language = 'en' }: { medication: string, language?: 'en' | 'es' }) => {
      const { data } = await api.post<MedicationLookupResponse>('/medications/lookup', { medication, language });
      return data;
    },
  });
}
