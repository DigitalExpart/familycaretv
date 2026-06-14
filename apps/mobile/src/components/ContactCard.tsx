import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EmergencyContact } from 'shared-types';

interface ContactCardProps {
  contact: EmergencyContact;
  onPress: () => void;
}

export function ContactCard({ contact, onPress }: ContactCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{contact.name}</Text>
      <Text style={styles.relationship}>{contact.relationship}</Text>
      <Text style={styles.phone}>📞 {contact.phone}</Text>
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
  relationship: {
    fontSize: 14,
    color: '#e65c00', // Distinct color for relationship
    marginBottom: 8,
    fontWeight: '500',
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
