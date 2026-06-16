import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useUpcomingEvents } from '../../features/events/events-api';
import { EmptyState } from '../../components/EmptyState';
import { Calendar } from 'react-native-calendars';

export default function CalendarScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const [selectedDate, setSelectedDate] = useState('');

  const { data: eventsData, isLoading } = useUpcomingEvents();
  const events = eventsData || [];

  // Generate marked dates for the calendar
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // Mark dates that have events
    events.forEach((event: any) => {
      const dateStr = event.startDateTime.split('T')[0];
      marks[dateStr] = {
        marked: true,
        dotColor: theme.primary,
        ...(selectedDate === dateStr ? { selected: true, selectedColor: theme.primary } : {})
      };
    });

    // If the selected date doesn't have an event, we still need to mark it as selected
    if (selectedDate && !marks[selectedDate]) {
      marks[selectedDate] = { selected: true, selectedColor: theme.primary };
    }

    return marks;
  }, [events, selectedDate, theme.primary]);

  // Filter events by selected date
  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events; // Show all upcoming if none selected
    
    return events.filter((event: any) => {
      return event.startDateTime.startsWith(selectedDate);
    });
  }, [events, selectedDate]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('nav.calendar')} />
      
      <Calendar
        onDayPress={(day: any) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={markedDates}
        theme={{
          backgroundColor: theme.background,
          calendarBackground: theme.backgroundElement,
          textSectionTitleColor: theme.textSecondary,
          selectedDayBackgroundColor: theme.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.primary,
          dayTextColor: theme.text,
          textDisabledColor: theme.textSecondary + '50',
          dotColor: theme.primary,
          selectedDotColor: '#ffffff',
          arrowColor: theme.primary,
          monthTextColor: theme.text,
          indicatorColor: theme.primary,
        }}
      />
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState message={selectedDate ? "No events scheduled for this day." : "Select a day to see events."} />
          }
          renderItem={({ item }) => (
            <View style={[styles.eventCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={{ color: theme.textSecondary }}>
                {new Date(item.startDateTime).toLocaleTimeString()}
              </Text>
              {item.description && (
                <Text style={{ color: theme.textSecondary, marginTop: 4 }}>{item.description}</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  eventCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  }
});
