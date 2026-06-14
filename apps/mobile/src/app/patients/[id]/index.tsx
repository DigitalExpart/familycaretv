import { View, Text, StyleSheet, ScrollView, Button, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePatient, useDeletePatient } from '../../../../features/patients/patients-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { useTranslation } from 'react-i18next';

export default function PatientDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: patient, isLoading, error } = usePatient(id as string);
  const deleteMutation = useDeletePatient();

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{patient.fullName}</Text>
        <Text style={styles.gender}>{patient.gender || 'Not specified'}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Date of Birth</Text>
        <Text style={styles.value}>{new Date(patient.dateOfBirth).toLocaleDateString()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Notes</Text>
        <Text style={styles.value}>{patient.notes || 'No notes provided.'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Summary</Text>

      <TouchableOpacity 
        style={styles.summaryCard} 
        onPress={() => router.push(`/patients/${patient.id}/doctors`)}
      >
        <Text style={styles.summaryLabel}>{t('dashboard.doctors')}</Text>
        <Text style={styles.summaryValue}>{patient.doctors?.length || 0}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.summaryCard} 
        onPress={() => router.push(`/patients/${patient.id}/contacts`)}
      >
        <Text style={styles.summaryLabel}>{t('dashboard.emergencyContacts')}</Text>
        <Text style={styles.summaryValue}>{patient.contacts?.length || 0}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.summaryCard} 
        onPress={() => router.push(`/patients/${patient.id}/medications`)}
      >
        <Text style={styles.summaryLabel}>{t('dashboard.medications')}</Text>
        <Text style={styles.summaryValue}>{patient.medications?.length || 0}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.summaryCard} 
        onPress={() => router.push(`/patients/${patient.id}/events`)}
      >
        <Text style={styles.summaryLabel}>{t('dashboard.events')}</Text>
        <Text style={styles.summaryValue}>{patient.events?.length || 0}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.summaryCard}
        onPress={() => router.push(`/patients/${patient.id}/notes`)}
      >
        <Text style={styles.summaryLabel}>{t('dashboard.notes')}</Text>
        <Text style={styles.summaryValue}>{patient.patientNotes?.length || 0}</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <Button title="Edit Patient" onPress={() => router.push(`/patients/edit/${patient.id}`)} />
        <View style={{ height: 16 }} />
        <Button title="Delete Patient" color="red" onPress={handleDelete} />
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
  gender: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    color: '#0066cc',
    fontWeight: 'bold',
  },
  actions: {
    padding: 20,
    marginTop: 20,
  },
});
