import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMedication, useDeleteMedication } from '../../../../features/medications/medications-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';

export default function MedicationDetailsScreen() {
  const { id: patientId, medicationId } = useLocalSearchParams<{ id: string; medicationId: string }>();
  const router = useRouter();
  
  const { data: medication, isLoading, error } = useMedication(medicationId as string);
  const deleteMutation = useDeleteMedication();

  if (isLoading) return <LoadingSpinner />;
  if (error || !medication) return <EmptyState message="Medication not found." />;

  const handleDelete = () => {
    Alert.alert(
      "Remove Medication",
      "Are you sure you want to remove this medication?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: () => {
            deleteMutation.mutate({ id: medication.id, patientId: patientId as string }, {
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
        <Text style={styles.name}>{medication.name}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Dosage</Text>
        <Text style={styles.value}>{medication.dosage || 'Not provided'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Days of Week</Text>
        <Text style={styles.value}>{medication.daysOfWeek?.length > 0 ? medication.daysOfWeek.join(', ') : 'Not provided'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Times of Day</Text>
        <Text style={styles.value}>{medication.timesOfDay?.length > 0 ? medication.timesOfDay.join(', ') : 'Not provided'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{medication.durationWeeks ? `${medication.durationWeeks} weeks` : 'Ongoing / Not provided'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Purpose</Text>
        <Text style={styles.value}>{medication.purpose || 'Not provided'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Side Effects</Text>
        <Text style={styles.value}>{medication.sideEffects || 'Not provided'}</Text>
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          ⚠️ This information may be AI-generated for educational purposes only and does not replace professional medical advice.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Edit Medication" onPress={() => router.push(`/patients/${patientId}/medications/edit/${medication.id}`)} />
        <View style={{ height: 16 }} />
        <Button title="Remove Medication" color="red" onPress={handleDelete} />
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
  disclaimerBox: {
    backgroundColor: '#fff3cd',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  disclaimerText: {
    color: '#856404',
    fontSize: 14,
    fontStyle: 'italic',
  },
  actions: {
    padding: 20,
    marginTop: 20,
  },
});
