import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Medication } from 'shared-types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/theme';

interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
}

export function MedicationCard({ medication, onPress }: MedicationCardProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.backgroundElement }]} onPress={onPress}>
      <Text style={[styles.name, { color: theme.text }]}>{medication.name}</Text>
      {medication.dosage && <Text style={[styles.detail, { color: theme.textSecondary }]}>{t('medications.form.dosage', 'Dosage')}: {medication.dosage}</Text>}
      {medication.frequency && <Text style={[styles.detail, { color: theme.textSecondary }]}>{t('medications.form.frequency', 'Frequency')}: {medication.frequency}</Text>}
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
