import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMedications } from '../../../../features/medications/medications-api';
import { MedicationCard } from '../../../../components/MedicationCard';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';

export default function MedicationsListScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: medications, isLoading, error } = useMedications(patientId as string);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <EmptyState message="Failed to load medications." />;

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <Button 
          title="Add Medication" 
          onPress={() => router.push(`/patients/${patientId}/medications/create`)} 
        />
      </View>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MedicationCard 
            medication={item} 
            onPress={() => router.push(`/patients/${patientId}/medications/${item.id}`)} 
          />
        )}
        ListEmptyComponent={<EmptyState message="No medications found." />}
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
