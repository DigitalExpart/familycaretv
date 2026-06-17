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

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['calendar-tasks', selectedDate],
    queryFn: async () => {
      const { data } = await api.get(`/users/me/dashboard?date=${selectedDate}`);
      return data;
    },
    enabled: !!selectedDate,
  });

  const tasks = dashboardData?.data?.todaysTasks || [];

  // Generate marked dates for the calendar
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // We don't have all events for the month easily accessible without a new endpoint, 
    // so we just mark the selected date for now.
    if (selectedDate) {
      marks[selectedDate] = { selected: true, selectedColor: theme.primary, marked: tasks.length > 0, dotColor: '#ffffff' };
    }

    return marks;
  }, [selectedDate, theme.primary, tasks.length]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('nav.calendar')} showBack={false} />
      
      <Calendar
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
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState message={selectedDate ? "No events scheduled for this day." : "Select a day to see events."} />
          }
          renderItem={({ item }) => (
            <View style={[styles.eventCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={{ color: theme.textSecondary }}>
                {item.type === 'MEDICATION' ? 'Medication' : 'Event'} • {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {item.patientName && (
                <Text style={{ color: theme.textSecondary, marginTop: 4 }}>Patient: {item.patientName}</Text>
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
