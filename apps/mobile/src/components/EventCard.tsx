import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Event } from 'shared-types';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  APPOINTMENT: '#0066cc',
  MEDICATION: '#28a745',
  TASK: '#ffc107',
};

export function EventCard({ event, onPress }: EventCardProps) {
  const color = TYPE_COLORS[event.type] || '#333';

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={[styles.type, { color }]}>{event.type}</Text>
      <Text style={styles.date}>
        {new Date(event.startDateTime).toLocaleString()}
      </Text>
      <Text style={styles.status}>Status: {event.status}</Text>
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
    borderLeftWidth: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
