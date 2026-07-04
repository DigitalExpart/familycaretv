import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { EmptyState } from '../../components/EmptyState';
import { Calendar } from 'react-native-calendars';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useUpcomingEvents } from '../../features/events/events-api';

export default function CalendarScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const { data: upcomingData, isLoading: eventsLoading } = useUpcomingEvents();
  const allEvents = Array.isArray(upcomingData) ? upcomingData : (upcomingData?.data || []);
  
  // Filter events for selected date locally
  const tasks = allEvents.filter((event: any) => {
    if (!event.startDateTime) return false;
    const eventDate = new Date(event.startDateTime);
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return dateStr === selectedDate;
  });

  // Generate marked dates for the calendar
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // Mark all dates that have events
    allEvents.forEach((event: any) => {
      if (!event.startDateTime) return;
      const eventDate = new Date(event.startDateTime);
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      if (!marks[dateStr]) {
        marks[dateStr] = { marked: true, dotColor: theme.primary };
      }
    });

    // Handle selected date override
    if (selectedDate) {
      const hasEvents = marks[selectedDate]?.marked || false;
      marks[selectedDate] = { 
        selected: true, 
        selectedColor: theme.primary, 
        marked: hasEvents, 
        dotColor: '#ffffff' 
      };
    }

    return marks;
  }, [selectedDate, theme.primary, allEvents]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('nav.calendar')} showBack={false} />
      
      <Calendar
        key={isDark ? 'dark' : 'light'}
        current={selectedDate}
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
      
      {eventsLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState message={selectedDate ? t('calendar.noEventsForDay', 'No events scheduled for this day.') : t('calendar.selectDay', 'Select a day to see events.')} />
          }
          renderItem={({ item }: { item: any }) => (
            <View style={[styles.eventCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={{ color: theme.textSecondary }}>
                {item.type === 'APPOINTMENT' ? t('calendar.appointment', 'Appointment') : (item.type === 'MEDICATION' ? t('calendar.medication', 'Medication') : t('calendar.task', 'Task'))} • {new Date(item.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {item.patient?.fullName && (
                <Text style={{ color: theme.textSecondary, marginTop: 4 }}>{t('calendar.patient', 'Patient')}: {item.patient.fullName}</Text>
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
