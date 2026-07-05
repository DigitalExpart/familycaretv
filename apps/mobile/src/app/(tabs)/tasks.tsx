import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { CheckCircle, Circle, Plus, Palette, Calendar as CalendarIcon, Clock, Repeat, Trash2 } from 'lucide-react-native';
import { useDashboardStats } from '../../features/dashboard/dashboard-api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { DaysOfWeekSelector } from '../../components/ui/DaysOfWeekSelector';

export default function TasksScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { data: dashboardData } = useDashboardStats();
  const queryClient = useQueryClient();

  const { data: allTasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks');
      return response.data;
    }
  });
  const allTasks = allTasksData || [];

  const [morningTask, setMorningTask] = useState('');
  const [daytimeTask, setDaytimeTask] = useState('');
  const [eveningTask, setEveningTask] = useState('');
  const [notes, setNotes] = useState('');

  // Global Task Settings
  const [taskDate, setTaskDate] = useState<Date>(new Date());
  const [taskTime, setTaskTime] = useState<Date>(new Date());
  const [isDailyTask, setIsDailyTask] = useState(false);
  const [taskDaysOfWeek, setTaskDaysOfWeek] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const addTaskMutation = useMutation({
    mutationFn: async (data: any) => api.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string, completed: boolean }) => api.patch(`/tasks/${id}`, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    }
  });

  const handleAddTask = (title: string, category: string, setter: (val: string) => void) => {
    if (!title.trim()) return;
    const timeStr = taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    addTaskMutation.mutate({ 
      title, 
      category, 
      date: taskDate.toISOString(),
      time: timeStr,
      isDaily: isDailyTask,
      daysOfWeek: taskDaysOfWeek
    });
    
    Alert.alert("Task Scheduled", `You will be reminded at ${timeStr}${isDailyTask ? ' daily' : taskDaysOfWeek.length > 0 ? ' on ' + taskDaysOfWeek.join(', ') : ''}.`);
    
    setter('');
    setTaskDaysOfWeek([]);
  };

  const renderTask = (task: any) => (
    <View key={task.id} style={styles.taskRow}>
      <TouchableOpacity style={styles.taskContent} onPress={() => toggleTaskMutation.mutate({ id: task.id, completed: !task.completed })}>
        {task.completed ? <CheckCircle color={theme.success} size={20} /> : <Circle color={theme.textSecondary} size={20} />}
        <View style={styles.taskTextContainer}>
          <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
          {(task.time || task.isDaily || (task.daysOfWeek && task.daysOfWeek.length > 0)) && (
            <Text style={[styles.taskSubtext, { color: theme.textSecondary }]}>
              {task.time ? task.time : ''}
              {task.isDaily ? ' • Daily' : (task.daysOfWeek && task.daysOfWeek.length > 0 ? ` • ${task.daysOfWeek.join(', ')}` : '')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTaskMutation.mutate(task.id)}>
        <Trash2 color={theme.error || '#ef4444'} size={20} />
      </TouchableOpacity>
    </View>
  );

  // Filter tasks based on selectedCalendarDate
  const visibleTasks = allTasks.filter((t: any) => {
    if (t.isDaily) return true;
    
    const [year, month, day] = selectedCalendarDate.split('-');
    const selectedDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = dayNames[selectedDateObj.getDay()];

    if (t.daysOfWeek && t.daysOfWeek.includes(selectedDayName)) return true;

    if (!t.date) return true; // Show tasks without dates
    const td = new Date(t.date);
    const dateStr = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, '0')}-${String(td.getDate()).padStart(2, '0')}`;
    return dateStr === selectedCalendarDate;
  });

  const morningTasks = visibleTasks.filter((t: any) => t.category === 'MORNING');
  const daytimeTasks = visibleTasks.filter((t: any) => t.category === 'DAYTIME');
  const eveningTasks = visibleTasks.filter((t: any) => t.category === 'EVENING');

  // Calendar marked dates
  const markedDates: any = {};
  allTasks.forEach((t: any) => {
    if (t.date && !t.isDaily && (!t.daysOfWeek || t.daysOfWeek.length === 0)) {
      const d = new Date(t.date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!markedDates[dateStr]) {
        markedDates[dateStr] = { marked: true, dotColor: theme.primary };
      }
    }
  });
  if (!markedDates[selectedCalendarDate]) {
    markedDates[selectedCalendarDate] = { selected: true, selectedColor: theme.warning };
  } else {
    markedDates[selectedCalendarDate].selected = true;
    markedDates[selectedCalendarDate].selectedColor = theme.warning;
  }

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('tasks.title') || 'Daily Tasks'} />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Task Calendar */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('tasks.taskCalendar')}</Text>
          <Calendar
            current={selectedCalendarDate}
            onDayPress={(day: any) => setSelectedCalendarDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.surfaceSecondary,
              calendarBackground: theme.surfaceSecondary,
              textSectionTitleColor: theme.textSecondary,
              selectedDayBackgroundColor: theme.warning,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.warning,
              dayTextColor: theme.text,
              textDisabledColor: theme.textSecondary + '50',
              dotColor: theme.warning,
              selectedDotColor: '#ffffff',
              arrowColor: theme.warning,
              monthTextColor: theme.text,
              indicatorColor: theme.warning,
            }}
          />
        </PremiumCard>

        {/* Global Task Settings */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Task Schedule Settings</Text>
          <Text style={{ color: theme.textSecondary, marginBottom: 12, fontSize: 12 }}>
            Set the date, time, and recurrence below, then add your task to the specific category.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { flex: 1, backgroundColor: theme.surfaceSecondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }]}>
              <CalendarIcon color={theme.textSecondary} size={16} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.text }}>{taskDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={[styles.input, { flex: 1, backgroundColor: theme.surfaceSecondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }]}>
              <Clock color={theme.textSecondary} size={16} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.text }}>{taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsDailyTask(!isDailyTask)} style={[styles.input, { paddingHorizontal: 12, backgroundColor: isDailyTask ? theme.warning : theme.surfaceSecondary, justifyContent: 'center', alignItems: 'center' }]}>
              <Repeat color={isDailyTask ? '#FFF' : theme.textSecondary} size={20} />
            </TouchableOpacity>
          </View>
          
          {!isDailyTask && (
            <DaysOfWeekSelector selectedDays={taskDaysOfWeek} onChange={setTaskDaysOfWeek} />
          )}

          {showDatePicker && (
            <DateTimePicker
              value={taskDate}
              mode="date"
              display="default"
              onValueChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setTaskDate(selectedDate);
              }}
              onDismiss={() => setShowDatePicker(false)}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={taskTime}
              mode="time"
              display="default"
              onValueChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) setTaskTime(selectedDate);
              }}
              onDismiss={() => setShowTimePicker(false)}
            />
          )}
        </PremiumCard>

        {/* Daily Tasks */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('tasks.title')}</Text>
          
          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>{t('tasks.morning')}</Text>
          <PremiumCard style={{ marginBottom: 16 }}>
            {morningTasks.length === 0 && (
              <Text style={{ color: theme.textSecondary }}>No morning tasks for this date.</Text>
            )}
            {morningTasks.map(renderTask)}
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, flex: 1, marginRight: 12 }]} 
                placeholder={t('tasks.add', 'Add task...')} 
                placeholderTextColor={theme.textSecondary}
                value={morningTask}
                onChangeText={setMorningTask}
              />
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => handleAddTask(morningTask, 'MORNING', setMorningTask)}>
                <Plus color="#FFF" size={20} />
                <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 4 }}>{t('common.add')}</Text>
              </TouchableOpacity>
            </View>
          </PremiumCard>

          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>{t('tasks.daytime')}</Text>
          <PremiumCard style={{ marginBottom: 16 }}>
            {daytimeTasks.length === 0 && (
              <Text style={{ color: theme.textSecondary }}>No daytime tasks for this date.</Text>
            )}
            {daytimeTasks.map(renderTask)}
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, flex: 1, marginRight: 12 }]} 
                placeholder={t('tasks.add', 'Add task...')} 
                placeholderTextColor={theme.textSecondary}
                value={daytimeTask}
                onChangeText={setDaytimeTask}
              />
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => handleAddTask(daytimeTask, 'DAYTIME', setDaytimeTask)}>
                <Plus color="#FFF" size={20} />
                <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 4 }}>{t('common.add')}</Text>
              </TouchableOpacity>
            </View>
          </PremiumCard>

          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>{t('tasks.evening')}</Text>
          <PremiumCard style={{ marginBottom: 16 }}>
            {eveningTasks.length === 0 && (
              <Text style={{ color: theme.textSecondary }}>No evening tasks for this date.</Text>
            )}
            {eveningTasks.map(renderTask)}
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, flex: 1, marginRight: 12 }]} 
                placeholder={t('tasks.add', 'Add task...')} 
                placeholderTextColor={theme.textSecondary}
                value={eveningTask}
                onChangeText={setEveningTask}
              />
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => handleAddTask(eveningTask, 'EVENING', setEveningTask)}>
                <Plus color="#FFF" size={20} />
                <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 4 }}>{t('common.add')}</Text>
              </TouchableOpacity>
            </View>
          </PremiumCard>
        </View>

        {/* Notes */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>{t('notes.title')}</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
            placeholder={t('tasks.writeJournal')}
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
          <AnimatedButton title={t('common.save')} onPress={() => {}} style={{ marginTop: 12 }} />
        </PremiumCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  subTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  taskRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#00000010' },
  taskContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  taskTextContainer: { marginLeft: 12, flex: 1 },
  taskTitle: { fontSize: 16 },
  taskSubtext: { fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 8 },
  input: { padding: 12, borderRadius: Radii.input, height: 48 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: Radii.input, height: 48, justifyContent: 'center' },
  dayBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  textArea: { padding: 16, borderRadius: Radii.input, minHeight: 120 }
});
