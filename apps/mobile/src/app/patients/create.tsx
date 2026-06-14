import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreatePatient } from '../../features/patients/patients-api';
import { PatientForm } from '../../components/PatientForm';

export default function CreatePatientScreen() {
  const router = useRouter();
  const createMutation = useCreatePatient();

  const handleSubmit = (data: any) => {
    // Add time component to the date string so it can be parsed correctly by the backend
    const patientData = {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth).toISOString(),
    };
    
    createMutation.mutate(patientData, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <PatientForm 
        onSubmit={handleSubmit} 
        isLoading={createMutation.isPending} 
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
