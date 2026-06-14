import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Doctor } from 'shared-types';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
}

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{doctor.name}</Text>
      {doctor.specialty && <Text style={styles.specialty}>{doctor.specialty}</Text>}
      {doctor.phone && <Text style={styles.contact}>📞 {doctor.phone}</Text>}
      {doctor.email && <Text style={styles.contact}>✉️ {doctor.email}</Text>}
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
  specialty: {
    fontSize: 14,
    color: '#0066cc',
    marginBottom: 8,
    fontWeight: '500',
  },
  contact: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
