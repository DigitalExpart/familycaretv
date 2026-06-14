import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateEvent } from '../../../../features/events/events-api';
import { EventForm } from '../../../../components/EventForm';

export default function CreateEventScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const createMutation = useCreateEvent();

  const handleSubmit = (data: any) => {
    createMutation.mutate(
      { ...data, patientId },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <EventForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
