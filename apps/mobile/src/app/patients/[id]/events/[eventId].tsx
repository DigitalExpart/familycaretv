import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEvent, useDeleteEvent } from '../../../../features/events/events-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { AnimatedButton } from '../../../../components/ui/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';

const TYPE_COLORS: Record<string, string> = {
  APPOINTMENT: '#0066cc',
  MEDICATION: '#28a745',
  TASK: '#ffc107',
};

export default function EventDetailsScreen() {
  const { id: patientId, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  
  const { data: event, isLoading, error } = useEvent(eventId as string);
  const deleteMutation = useDeleteEvent();

  if (isLoading) return <LoadingSpinner />;
  if (error || !event) return <EmptyState message={t('events.listEmpty', 'Event not found.')} />;

  const handleDelete = () => {
    Alert.alert(
      t('common.delete', 'Delete Event'),
      t('common.confirmDelete', 'Are you sure you want to delete this event?'),
      [
        { text: t('common.cancel', 'Cancel'), style: "cancel" },
        { 
          text: t('common.delete', 'Delete'), 
          style: "destructive", 
          onPress: () => {
            deleteMutation.mutate({ id: event.id, patientId: patientId as string }, {
              onSuccess: () => {
                router.back();
              }
            });
          }
        }
      ]
    );
  };

  const color = TYPE_COLORS[event.type] || '#333';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderTopWidth: 6, borderTopColor: color, backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
        <Text style={[styles.type, { color }]}>{t(`events.types.${event.type}`, event.type)}</Text>
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('events.form.date', 'Start Date & Time')}</Text>
        <Text style={[styles.value, { color: theme.text }]}>{new Date(event.startDateTime).toLocaleString()}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('events.form.description', 'Description')}</Text>
        <Text style={[styles.value, { color: theme.text }]}>{event.description || t('common.notProvided', 'No description provided.')}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('events.form.reminder', 'Reminder')}</Text>
        <Text style={[styles.value, { color: theme.text }]}>
          {event.reminderMinutes ? `${event.reminderMinutes} ${t('common.minutesBefore', 'minutes before')}` : t('common.noReminder', 'No reminder')}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('common.status', 'Status')}</Text>
        <Text style={[styles.value, { color: theme.text }]}>{new Date(event.startDateTime).getTime() < Date.now() ? 'INACTIVE' : event.status}</Text>
      </View>

      <View style={styles.actions}>
        <AnimatedButton 
          title={t('events.edit', 'Edit Event')} 
          variant="primary"
          onPress={() => router.push(`/patients/${patientId}/events/edit/${event.id}`)} 
        />
        <View style={{ height: 16 }} />
        <AnimatedButton 
          title={t('common.delete', 'Delete Event')} 
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  type: {
    fontSize: 14,
    fontWeight: 'bold',
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
  actions: {
    padding: 20,
    marginTop: 20,
  },
});
