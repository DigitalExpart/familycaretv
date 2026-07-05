import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientHeader } from '../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { Trash2 } from 'lucide-react-native';
import { useCreateDoctor } from '../../../../features/doctors/doctors-api';
import { DoctorForm } from '../../../../components/DoctorForm';

export default function CreateDoctorScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('doctors.add', 'Add Doctor')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <DoctorForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
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
