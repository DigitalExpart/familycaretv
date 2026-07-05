import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientHeader } from '../../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../../hooks/useTheme';
import { Colors } from '../../../../../constants/theme';
import { Trash2 } from 'lucide-react-native';
import { useDoctor, useUpdateDoctor } from '../../../../../features/doctors/doctors-api';
import { DoctorForm } from '../../../../../components/DoctorForm';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../../components/EmptyState';

export default function EditDoctorScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('doctors.edit', 'Edit Doctor')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <DoctorForm 
        initialData={doctor}
        onSubmit={handleSubmit} 
        isLoading={updateMutation.isPending} 
      />
          </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
