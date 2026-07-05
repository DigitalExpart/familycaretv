import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDoctor, useDeleteDoctor } from '../../../../features/doctors/doctors-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { AnimatedButton } from '../../../../components/ui/AnimatedButton';
import { Phone, Mail } from 'lucide-react-native';

export default function DoctorDetailsScreen() {
  const { id: patientId, doctorId } = useLocalSearchParams<{ id: string; doctorId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  
  const { data: doctor, isLoading, error } = useDoctor(doctorId as string);
  const deleteMutation = useDeleteDoctor();

  if (isLoading) return <LoadingSpinner />;
  if (error || !doctor) return <EmptyState message={t('doctors.listEmpty', 'Doctor not found.')} />;

  const handleDelete = () => {
    Alert.alert(
      t('doctors.actions.confirmDelete', 'Remove Doctor'),
      t('doctors.actions.confirmDeleteDesc', 'Are you sure you want to remove this doctor?'),
      [
        { text: t('common.cancel', 'Cancel'), style: "cancel" },
        { 
          text: t('common.delete', 'Remove'), 
          style: "destructive", 
          onPress: () => {
            deleteMutation.mutate({ id: doctor.id, patientId: patientId as string }, {
              onSuccess: () => {
                router.back();
              }
            });
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
        <Text style={[styles.name, { color: theme.text }]}>{doctor.name}</Text>
        {doctor.specialty && <Text style={styles.specialty}>{doctor.specialty}</Text>}
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Phone size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.label, { color: theme.textSecondary, marginBottom: 0 }]}>{t('doctors.form.phone', 'Phone')}</Text>
        </View>
        <Text style={[styles.value, { color: theme.text }]}>{doctor.phone || t('common.notProvided', 'Not provided')}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Mail size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.label, { color: theme.textSecondary, marginBottom: 0 }]}>{t('doctors.form.email', 'Email')}</Text>
        </View>
        <Text style={[styles.value, { color: theme.text }]}>{doctor.email || t('common.notProvided', 'Not provided')}</Text>
      </View>

      <View style={styles.actions}>
        <AnimatedButton 
          title={t('doctors.edit', 'Edit Doctor')} 
          variant="primary" 
          onPress={() => router.push(`/patients/${patientId}/doctors/edit/${doctor.id}`)} 
          style={{ marginBottom: 12 }}
        />
        <AnimatedButton 
          title={t('doctors.actions.delete', 'Remove Doctor')} 
          variant="danger" 
          onPress={handleDelete} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  specialty: {
    fontSize: 16,
    color: '#0066cc',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    padding: 20,
    marginTop: 20,
  },
});
