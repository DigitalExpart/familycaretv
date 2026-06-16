import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePatient, useUpdatePatient } from '../../../features/patients/patients-api';
import { PatientForm } from '../../../components/PatientForm';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { EmptyState } from '../../../components/EmptyState';
import { GradientHeader } from '../../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../hooks/useTheme';
import { Colors } from '../../../constants/theme';

export default function EditPatientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  
  const { data: patient, isLoading, error } = usePatient(id as string);
  const updateMutation = useUpdatePatient();

  if (isLoading) return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('patients.edit') || "Edit Patient"} />
      <LoadingSpinner />
    </View>
  );

  if (error || !patient) return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('patients.edit') || "Edit Patient"} />
      <EmptyState message="Patient not found." />
    </View>
  );

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('patients.edit') || "Edit Patient"} />
      <ScrollView style={styles.scrollContent}>
        <PatientForm 
          initialData={patient}
          onSubmit={handleSubmit} 
          isLoading={updateMutation.isPending} 
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
});
