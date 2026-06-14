import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMedication, useUpdateMedication } from '../../../../../features/medications/medications-api';
import { MedicationForm } from '../../../../../components/MedicationForm';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../../components/EmptyState';

export default function EditMedicationScreen() {
  const { id: patientId, medicationId } = useLocalSearchParams<{ id: string; medicationId: string }>();
  const router = useRouter();
  
  const { data: medication, isLoading, error } = useMedication(medicationId as string);
  const updateMutation = useUpdateMedication();

  if (isLoading) return <LoadingSpinner />;
  if (error || !medication) return <EmptyState message="Medication not found." />;

  const handleSubmit = (data: any) => {
    updateMutation.mutate(
      { id: medication.id, updates: data },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <MedicationForm 
        initialData={medication}
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
