import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { Event } from 'shared-types';

export function useEvents(patientId?: string) {
  return useQuery({
    queryKey: ['events', { patientId }],
    queryFn: async () => {
      const url = patientId ? `/events?patientId=${patientId}` : '/events/upcoming';
      const { data } = await api.get<Event[]>(url);
      return data;
    },
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: async () => {
      const { data } = await api.get('/events/upcoming');
      return data;
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get<Event>(`/events/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newEvent: Partial<Event>) => {
      const { data } = await api.post<Event>('/events', newEvent);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', { patientId: variables.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
      const { data } = await api.patch<Event>(`/events/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events', { patientId: data.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['event', data.id] });
      queryClient.invalidateQueries({ queryKey: ['patients', data.patientId] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string, patientId: string }) => {
      await api.delete(`/events/${id}`);
      return { id, patientId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', { patientId: variables.patientId }] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}
