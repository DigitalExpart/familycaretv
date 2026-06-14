import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateDoctor } from '../../../../features/doctors/doctors-api';
import { DoctorForm } from '../../../../components/DoctorForm';

export default function CreateDoctorScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const createMutation = useCreateDoctor();

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
      <DoctorForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
