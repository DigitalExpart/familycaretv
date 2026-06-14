import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { usePatients } from '../../features/patients/patients-api';
import { PatientCard } from '../../components/PatientCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export default function PatientsListScreen() {
  const router = useRouter();
  const { data: patients, isLoading, error } = usePatients();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <EmptyState message="Error loading patients." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PatientCard 
            patient={item} 
            onPress={(id) => router.push(`/patients/${id}`)} 
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No patients found. Add one to get started." />}
      />
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/patients/create')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabIcon: {
    fontSize: 24,
    color: '#fff',
  },
});
