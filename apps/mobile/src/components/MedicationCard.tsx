import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Medication } from 'shared-types';

interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
}

export function MedicationCard({ medication, onPress }: MedicationCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{medication.name}</Text>
      {medication.dosage && <Text style={styles.detail}>Dosage: {medication.dosage}</Text>}
      {medication.frequency && <Text style={styles.detail}>Frequency: {medication.frequency}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
