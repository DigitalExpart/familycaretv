import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePatient, useUpdatePatient } from '../../../features/patients/patients-api';
import { PatientForm } from '../../../components/PatientForm';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { EmptyState } from '../../../components/EmptyState';

export default function EditPatientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { data: patient, isLoading, error } = usePatient(id as string);
  const updateMutation = useUpdatePatient();

  if (isLoading) return <LoadingSpinner />;
  if (error || !patient) return <EmptyState message="Patient not found." />;

  const handleSubmit = (data: any) => {
    const updates = {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth).toISOString(),
    };
    
    updateMutation.mutate({ id: patient.id, updates }, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <PatientForm 
        initialData={patient}
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
