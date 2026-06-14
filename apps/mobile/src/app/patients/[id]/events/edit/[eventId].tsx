import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEvent, useUpdateEvent } from '../../../../../features/events/events-api';
import { EventForm } from '../../../../../components/EventForm';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../../components/EmptyState';

export default function EditEventScreen() {
  const { id: patientId, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
  const router = useRouter();
  
  const { data: event, isLoading, error } = useEvent(eventId as string);
  const updateMutation = useUpdateEvent();

  if (isLoading) return <LoadingSpinner />;
  if (error || !event) return <EmptyState message="Event not found." />;

  const handleSubmit = (data: any) => {
    updateMutation.mutate(
      { id: event.id, updates: data },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <EventForm 
        initialData={event}
        onSubmit={handleSubmit} 
        isLoading={updateMutation.isPending} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
