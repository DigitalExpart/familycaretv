import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEvents } from '../../../../features/events/events-api';
import { EventCard } from '../../../../components/EventCard';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';

export default function EventsListScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: events, isLoading, error } = useEvents(patientId as string);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <EmptyState message="Failed to load events." />;

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <Button 
          title="Add Event" 
          onPress={() => router.push(`/patients/${patientId}/events/create`)} 
        />
      </View>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={() => router.push(`/patients/${patientId}/events/${item.id}`)} 
          />
        )}
        ListEmptyComponent={<EmptyState message="No events found." />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerActions: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
