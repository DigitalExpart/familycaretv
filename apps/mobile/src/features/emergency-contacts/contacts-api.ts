import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { EmergencyContact } from 'shared-types';

export function useContacts(patientId: string) {
  return useQuery({
    queryKey: ['contacts', { patientId }],
    queryFn: async () => {
      const { data } = await api.get<EmergencyContact[]>(`/emergency-contacts`, { params: { patientId } });
      return data;
    },
    enabled: !!patientId,
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      const { data } = await api.get<EmergencyContact>(`/emergency-contacts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newContact: Partial<EmergencyContact>) => {
      const { data } = await api.post<EmergencyContact>('/emergency-contacts', newContact);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', { patientId: variables.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmergencyContact> }) => {
      const { data } = await api.patch<EmergencyContact>(`/emergency-contacts/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', { patientId: data.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['contact', data.id] });
      queryClient.invalidateQueries({ queryKey: ['patients', data.patientId] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string, patientId: string }) => {
      await api.delete(`/emergency-contacts/${id}`);
      return { id, patientId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', { patientId: variables.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}
