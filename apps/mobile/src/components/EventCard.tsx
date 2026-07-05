import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Event } from 'shared-types';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/theme';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const color = TYPE_COLORS[event.type] || theme.text;
  const translatedType = t(`events.types.${event.type}`, event.type);
  const statusLabel = t(`events.status.${event.status}`, event.status);

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.backgroundElement, borderLeftColor: color }]} onPress={onPress}>
      <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
      <Text style={[styles.type, { color }]}>{translatedType}</Text>
      <Text style={[styles.date, { color: theme.textSecondary }]}>
        {new Date(event.startDateTime).toLocaleString()}
      </Text>
      <Text style={[styles.status, { color: theme.textSecondary }]}>{t('events.statusLabel', 'Status')}: {new Date(event.startDateTime).getTime() < Date.now() ? t('events.status.INACTIVE', 'INACTIVE') : statusLabel}</Text>
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
