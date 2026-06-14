import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDoctor, useDeleteDoctor } from '../../../../features/doctors/doctors-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';

export default function DoctorDetailsScreen() {
  const { id: patientId, doctorId } = useLocalSearchParams<{ id: string; doctorId: string }>();
  const router = useRouter();
  
  const { data: doctor, isLoading, error } = useDoctor(doctorId as string);
  const deleteMutation = useDeleteDoctor();

  if (isLoading) return <LoadingSpinner />;
  if (error || !doctor) return <EmptyState message="Doctor not found." />;

  const handleDelete = () => {
    Alert.alert(
      "Remove Doctor",
      "Are you sure you want to remove this doctor?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: () => {
            deleteMutation.mutate({ id: doctor.id, patientId: patientId as string }, {
              onSuccess: () => {
                router.back();
              }
            });
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{doctor.name}</Text>
        {doctor.specialty && <Text style={styles.specialty}>{doctor.specialty}</Text>}
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{doctor.phone || 'Not provided'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{doctor.email || 'Not provided'}</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Edit Doctor" onPress={() => router.push(`/patients/${patientId}/doctors/edit/${doctor.id}`)} />
        <View style={{ height: 16 }} />
        <Button title="Remove Doctor" color="red" onPress={handleDelete} />
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
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  specialty: {
    fontSize: 16,
    color: '#0066cc',
    marginTop: 4,
    fontWeight: '500',
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
