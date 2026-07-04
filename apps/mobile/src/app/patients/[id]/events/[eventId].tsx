import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEvent, useDeleteEvent } from '../../../../features/events/events-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { AnimatedButton } from '../../../../components/ui/AnimatedButton';

const TYPE_COLORS: Record<string, string> = {
  APPOINTMENT: '#0066cc',
  MEDICATION: '#28a745',
  TASK: '#ffc107',
};

export default function EventDetailsScreen() {
  const { id: patientId, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
  const router = useRouter();
  
  const { data: event, isLoading, error } = useEvent(eventId as string);
  const deleteMutation = useDeleteEvent();

  if (isLoading) return <LoadingSpinner />;
  if (error || !event) return <EmptyState message="Event not found." />;

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
              }
            });
          }
        }
      ]
    );
  };

  const color = TYPE_COLORS[event.type] || '#333';

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { borderTopWidth: 6, borderTopColor: color }]}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={[styles.type, { color }]}>{event.type}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Start Date & Time</Text>
        <Text style={styles.value}>{new Date(event.startDateTime).toLocaleString()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{event.description || 'No description provided.'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Reminder</Text>
        <Text style={styles.value}>
          {event.reminderMinutes ? `${event.reminderMinutes} minutes before` : 'No reminder'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{new Date(event.startDateTime).getTime() < Date.now() ? 'INACTIVE' : event.status}</Text>
      </View>

      <View style={styles.actions}>
        <AnimatedButton 
          title="Edit Event" 
          onPress={() => router.push(`/patients/${patientId}/events/edit/${event.id}`)} 
        />
        <View style={{ height: 16 }} />
        <AnimatedButton 
          title="Delete Event" 
          variant="danger" 
          onPress={handleDelete} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  type: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    padding: 20,
    marginTop: 20,
  },
});
