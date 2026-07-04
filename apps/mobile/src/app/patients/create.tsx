import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreatePatient } from '../../features/patients/patients-api';
import { PatientForm } from '../../components/PatientForm';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/theme';

export default function CreatePatientScreen() {
  const router = useRouter();
  const createMutation = useCreatePatient();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const handleSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('patients.add')} />
      <ScrollView style={styles.scrollContent}>
        <PatientForm 
          onSubmit={handleSubmit} 
          isLoading={createMutation.isPending} 
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
