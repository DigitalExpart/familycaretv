import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePatient, useDeletePatient } from '../../../features/patients/patients-api';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { EmptyState } from '../../../components/EmptyState';
import { GradientHeader } from '../../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../hooks/useTheme';
import { Colors } from '../../../constants/theme';
import { Edit, Trash2 } from 'lucide-react-native';

export default function PatientDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: patient, isLoading, error } = usePatient(id as string);
  const deleteMutation = useDeletePatient();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  if (isLoading) return <LoadingSpinner />;
  if (error || !patient) return <EmptyState message="Patient not found." />;

  const handleDelete = () => {
    Alert.alert(
      "Delete Patient",
      "Are you sure you want to delete this patient?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            deleteMutation.mutate(patient.id, {
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader 
        title={patient.fullName} 
        subtitle={patient.gender || 'Not specified'} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {new Date(patient.dateOfBirth).toLocaleDateString()}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Text style={styles.label}>Notes</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {patient.notes || 'No notes provided.'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Summary</Text>

        <TouchableOpacity 
          style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]} 
          onPress={() => router.push(`/patients/${patient.id}/doctors`)}
        >
          <Text style={[styles.summaryLabel, { color: theme.text }]}>{t('patients.tabs.doctors', 'Doctors')}</Text>
          <Text style={[styles.summaryValue, { color: theme.primary }]}>{patient.doctors?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]} 
          onPress={() => router.push(`/patients/${patient.id}/contacts`)}
        >
          <Text style={[styles.summaryLabel, { color: theme.text }]}>{t('patients.tabs.contacts', 'Emergency Contacts')}</Text>
          <Text style={[styles.summaryValue, { color: theme.primary }]}>{patient.contacts?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]} 
          onPress={() => router.push(`/patients/${patient.id}/medications`)}
        >
          <Text style={[styles.summaryLabel, { color: theme.text }]}>{t('patients.tabs.medications', 'Medications')}</Text>
          <Text style={[styles.summaryValue, { color: theme.primary }]}>{patient.medications?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]} 
          onPress={() => router.push(`/patients/${patient.id}/events`)}
        >
          <Text style={[styles.summaryLabel, { color: theme.text }]}>{t('patients.tabs.events', 'Events')}</Text>
          <Text style={[styles.summaryValue, { color: theme.primary }]}>{patient.events?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]}
          onPress={() => router.push(`/patients/${patient.id}/notes`)}
        >
          <Text style={[styles.summaryLabel, { color: theme.text }]}>{t('patients.tabs.notes', 'Notes')}</Text>
          <Text style={[styles.summaryValue, { color: theme.primary }]}>{patient.patientNotes?.length || 0}</Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push(`/patients/edit/${patient.id}`)}
          >
            <Edit color="#FFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Edit Patient</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Trash2 color="#FFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Delete Patient</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  summaryCard: {
    padding: 16,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    padding: 20,
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
