import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useEvent, useUpdateEvent, useDeleteEvent } from '../../../../../features/events/events-api';
import { EventForm } from '../../../../../components/EventForm';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { GradientHeader } from '../../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../../hooks/useTheme';
import { Colors } from '../../../../../constants/theme';
import { Trash2 } from 'lucide-react-native';

export default function EditEventScreen() {
  const { t } = useTranslation();
  const { id: patientId, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data: eventResponse, isLoading, error } = useEvent(eventId as string);
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const event = eventResponse;

  if (isLoading) return <LoadingSpinner />;
  if (error || !event) return <EmptyState message="Event not found." />;

  const handleSubmit = (data: any) => {
    updateMutation.mutate(
      { id: event.id, updates: data },
      {
        onSuccess: (updates: any) => {
          queryClient.setQueryData(['events', patientId], (old: any) => {
            if (!old) return old;
            return { ...old, data: (old as any).data?.map((event: any) => 
              event.id === eventId ? { ...event, ...updates } : event
            )};
          });
          router.back();
        },
      }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            deleteMutation.mutate({ id: event.id, patientId: patientId as string }, {
              onSuccess: () => {
                router.back();
                // Also back out of the event details screen if necessary
              }
            });
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('events.edit', 'Edit Event')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <EventForm 
          initialData={event} 
          onSubmit={handleSubmit} 
          isLoading={updateMutation.isPending} 
        />
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.deleteButton]}
            onPress={handleDelete}
          >
            <Trash2 color="#FF3B30" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  actions: {
    padding: 16,
    marginTop: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
