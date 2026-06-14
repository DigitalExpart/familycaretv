import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDoctors } from '../../../../features/doctors/doctors-api';
import { DoctorCard } from '../../../../components/DoctorCard';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';

export default function DoctorsListScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: doctors, isLoading, error } = useDoctors(patientId as string);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <EmptyState message="Failed to load doctors." />;

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <Button 
          title="Add Doctor" 
          onPress={() => router.push(`/patients/${patientId}/doctors/create`)} 
        />
      </View>
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DoctorCard 
            doctor={item} 
            onPress={() => router.push(`/patients/${patientId}/doctors/${item.id}`)} 
          />
        )}
        ListEmptyComponent={<EmptyState message="No doctors found." />}
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
