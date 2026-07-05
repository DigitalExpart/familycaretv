import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Patient } from 'shared-types';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/theme';

interface PatientCardProps {
  patient: Patient;
  onPress: (id: string) => void;
}

export function PatientCard({ patient, onPress }: PatientCardProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border, borderWidth: isDark ? 1 : 0 }]} onPress={() => onPress(patient.id)}>
      <View style={styles.header}>
        <Text style={[styles.name, { color: theme.text }]}>{patient.fullName}</Text>
        {patient.gender && <Text style={[styles.gender, { color: theme.textSecondary, backgroundColor: theme.surfaceSecondary }]}>{patient.gender}</Text>}
      </View>
      <Text style={[styles.details, { color: theme.textSecondary }]}>
        DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
      </Text>
      {patient.notes && (
        <Text style={[styles.notes, { color: theme.textSecondary }]} numberOfLines={2}>
          {patient.notes}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  gender: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});
