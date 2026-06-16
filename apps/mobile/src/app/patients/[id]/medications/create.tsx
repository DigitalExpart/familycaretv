import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GradientHeader } from '../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { Trash2 } from 'lucide-react-native';
import { useCreateMedication } from '../../../../features/medications/medications-api';
import { MedicationForm } from '../../../../components/MedicationForm';
import { requestNotificationPermissions, scheduleMedicationNotifications } from '../../../../utils/notifications';

export default function CreateMedicationScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const createMutation = useCreateMedication();
  const handleSubmit = async (data: any) => {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      Alert.alert('Permissions Required', 'Please enable notifications in your device settings so we can remind you about this medication!');
    }

    createMutation.mutate(
      { ...data, patientId },
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
      <GradientHeader title="Add Medication" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <MedicationForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
          </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
