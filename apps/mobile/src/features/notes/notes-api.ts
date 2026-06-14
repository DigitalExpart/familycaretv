import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PatientNote } from 'shared-types';

// Queries
export function useNotes(patientId: string) {
  return useQuery({
    queryKey: ['notes', patientId],
    queryFn: async () => {
      const { data } = await api.get<PatientNote[]>(`/patients/${patientId}/notes`);
      return data;
    },
    enabled: !!patientId,
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const { data } = await api.get<PatientNote>(`/notes/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Mutations
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteData: Omit<PatientNote, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await api.post<PatientNote>('/notes', noteData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['patient', data.patientId] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...noteData }: Partial<PatientNote> & { id: string }) => {
      const { data } = await api.patch<PatientNote>(`/notes/${id}`, noteData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['note', data.id] });
      queryClient.invalidateQueries({ queryKey: ['patient', data.patientId] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<PatientNote>(`/notes/${id}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['patient', data.patientId] });
    },
  });
}
