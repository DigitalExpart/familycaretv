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
import { useCalendarEvents } from '../../features/events/events-api';

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
  const [currentMonth, setCurrentMonth] = useState(getTodayString().substring(0, 7));

  // Fetch for the current month with accurate last-day-of-month calculation
  const { startDate, endDate } = useMemo(() => {
    const [yStr, mStr] = currentMonth.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const daysInMonth = new Date(y, m, 0).getDate();
    return {
      startDate: `${currentMonth}-01`,
      endDate: `${currentMonth}-${String(daysInMonth).padStart(2, '0')}`,
    };
  }, [currentMonth]);

  const { data: upcomingData, isLoading: eventsLoading } = useCalendarEvents(startDate, endDate);
  const allEvents = Array.isArray(upcomingData) ? upcomingData : (upcomingData?.data || []);
  
  // Filter events and tasks for selected date locally
  const tasks = useMemo(() => {
    return allEvents.filter((event: any) => {
      if (!event.startDateTime) return false;
      const isoDatePrefix = typeof event.startDateTime === 'string' ? event.startDateTime.slice(0, 10) : '';
      const eventDate = new Date(event.startDateTime);
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;
      return localDateStr === selectedDate || isoDatePrefix === selectedDate;
    });
  }, [allEvents, selectedDate]);

  // Formatted date label, e.g. "Saturday, September 5"
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  // Generate marked dates for the calendar
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // Mark all dates that have events
    allEvents.forEach((event: any) => {
      if (!event.startDateTime) return;
      const isoDatePrefix = typeof event.startDateTime === 'string' ? event.startDateTime.slice(0, 10) : '';
      const eventDate = new Date(event.startDateTime);
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;
      
      const targetDate = localDateStr || isoDatePrefix;
      if (targetDate && !marks[targetDate]) {
        marks[targetDate] = { marked: true, dotColor: theme.primary };
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

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'APPOINTMENT':
        return { label: t('calendar.appointment', 'Appointment'), color: '#8B5CF6', bg: '#8B5CF618' };
      case 'MEDICATION':
      case 'PET_MEDICATION':
        return { label: t('calendar.medication', 'Medication'), color: '#F59E0B', bg: '#F59E0B18' };
      case 'PET_VACCINATION':
        return { label: t('calendar.petVaccination', 'Pet Vaccine'), color: '#EC4899', bg: '#EC489918' };
      case 'KIDS_TASK':
        return { label: t('calendar.kidsTask', "Kid's Task"), color: '#10B981', bg: '#10B98118' };
      case 'EVENT':
        return { label: t('calendar.event', 'Event'), color: '#6366F1', bg: '#6366F118' };
      default:
        return { label: t('calendar.task', 'Task'), color: '#00C9A7', bg: '#00C9A718' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('nav.calendar')} showBack={false} />
      
      <Calendar
        key={isDark ? 'dark' : 'light'}
        current={selectedDate}
        onDayPress={(day: any) => {
          setSelectedDate(day.dateString);
        }}
        onMonthChange={(month: any) => {
          // month.dateString is like "2026-07-01"
          setCurrentMonth(month.dateString.substring(0, 7));
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
          ListHeaderComponent={
            selectedDate ? (
              <View style={styles.scheduleHeader}>
                <Text style={[styles.selectedDateText, { color: theme.textSecondary }]}>
                  {formattedSelectedDate}
                </Text>
                <Text style={[styles.scheduleTitle, { color: theme.text }]}>
                  {t('calendar.todaysSchedule', "Today's Schedule")}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState message={selectedDate ? t('calendar.noItemsForDay', 'No events or tasks scheduled for this day.') : t('calendar.selectDay', 'Select a day to see events.')} />
          }
          renderItem={({ item }: { item: any }) => {
            const typeInfo = getTypeStyle(item.type);
            const timeFormatted = item.startDateTime 
              ? new Date(item.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <View style={[styles.eventCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.typePill, { backgroundColor: typeInfo.bg }]}>
                    <Text style={[styles.typeText, { color: typeInfo.color }]}>
                      {typeInfo.label}
                    </Text>
                  </View>
                  {timeFormatted ? (
                    <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                      {timeFormatted}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
                {item.status && (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
                    Status: {item.status}
                  </Text>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 32 },
  scheduleHeader: {
    marginBottom: 14,
    paddingTop: 8,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  eventCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
});
