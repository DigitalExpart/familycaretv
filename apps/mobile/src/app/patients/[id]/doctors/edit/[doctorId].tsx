import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDoctor, useUpdateDoctor } from '../../../../features/doctors/doctors-api';
import { DoctorForm } from '../../../../components/DoctorForm';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';

export default function EditDoctorScreen() {
  const { id: patientId, doctorId } = useLocalSearchParams<{ id: string; doctorId: string }>();
  const router = useRouter();
  
  const { data: doctor, isLoading, error } = useDoctor(doctorId as string);
  const updateMutation = useUpdateDoctor();

  if (isLoading) return <LoadingSpinner />;
  if (error || !doctor) return <EmptyState message="Doctor not found." />;

  const handleSubmit = (data: any) => {
    updateMutation.mutate(
      { id: doctor.id, updates: data },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <DoctorForm 
        initialData={doctor}
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
