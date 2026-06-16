import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEvents } from '../../../../features/events/events-api';
import { EventCard } from '../../../../components/EventCard';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { GradientHeader } from '../../../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { Plus } from 'lucide-react-native';

export default function EventsListScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { data: events, isLoading, error } = useEvents(patientId as string);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('events.title') || "Events"} />
      
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState message="Failed to load events." />
      ) : (
        <>
          <View style={[styles.header, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>{t('events.title') || "Events"}</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push(`/patients/${patientId}/events/create`)}
            >
              <Plus color="#FFF" size={20} />
              <Text style={styles.addButtonText}>{t('events.add') || "Add Event"}</Text>
            </TouchableOpacity>
          </View>

          {events?.length === 0 ? (
            <EmptyState message={t('events.listEmpty') || "No events found."} />
          ) : (
            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EventCard 
                  event={item} 
                  onPress={() => router.push(`/patients/${patientId}/events/${item.id}`)} 
                />
              )}
              contentContainerStyle={styles.list}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  list: {
    paddingVertical: 8,
  },
});
