import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientHeader } from '../../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../../hooks/useTheme';
import { Colors } from '../../../../../constants/theme';
import { Trash2 } from 'lucide-react-native';
import { useMedication, useUpdateMedication } from '../../../../../features/medications/medications-api';
import { MedicationForm } from '../../../../../components/MedicationForm';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../../components/EmptyState';
import { requestNotificationPermissions, scheduleMedicationNotifications } from '../../../../../utils/notifications';

export default function EditMedicationScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { id: patientId, medicationId } = useLocalSearchParams<{ id: string; medicationId: string }>();
  const router = useRouter();
  
  const { data: medication, isLoading, error } = useMedication(medicationId as string);
  const updateMutation = useUpdateMedication();

  if (isLoading) return <LoadingSpinner />;
  if (error || !medication) return <EmptyState message="Medication not found." />;

  const handleSubmit = async (data: any) => {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      Alert.alert('Permissions Required', 'Please enable notifications in your device settings so we can remind you about this medication!');
    }

    updateMutation.mutate(
      { id: medication.id, updates: data },
      {
        onSuccess: async (response: any) => {
          if (hasPermission && response.daysOfWeek && response.timesOfDay) {
            await scheduleMedicationNotifications(response.id, response.name, response.daysOfWeek, response.timesOfDay);
          }
          router.back();
        },
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('medications.edit', 'Edit Medication')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <MedicationForm 
        initialData={medication}
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
