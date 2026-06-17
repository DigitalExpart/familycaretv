import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { CheckCircle, Circle, Plus, Palette, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useDashboardStats } from '../../features/dashboard/dashboard-api';

export default function TasksScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { data: dashboardData } = useDashboardStats();

  const [newTask, setNewTask] = useState('');
  const [notes, setNotes] = useState('');

  const todaysTasks = dashboardData?.todaysTasks || [];

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const calendarDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('tasks.title') || 'Daily Tasks'} />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Verse of the Day */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.primary, fontSize: 14, textTransform: 'uppercase' }]}>Verse of the Day</Text>
          {dashboardData?.verseOfTheDay ? (
            <>
              <Text style={{ color: theme.text, fontSize: 16, fontStyle: 'italic', marginVertical: 8 }}>
                "{dashboardData.verseOfTheDay.verse}"
              </Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'right' }}>
                — {dashboardData.verseOfTheDay.reference}
              </Text>
            </>
          ) : (
            <Text style={{ color: theme.textSecondary }}>No verse available today.</Text>
          )}
        </PremiumCard>

        {/* Color your Emotions */}
        <PremiumCard style={{ marginBottom: 20, alignItems: 'center', paddingVertical: 30, backgroundColor: theme.surfaceSecondary }}>
          <Palette color={theme.warning} size={48} style={{ marginBottom: 12 }} />
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600' }}>Color your Emotions</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>Images coming soon</Text>
        </PremiumCard>

        {/* Daily Tasks */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Tasks</Text>
          
          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>{t('tasks.morning')}</Text>
          <PremiumCard style={{ marginBottom: 16 }}>
            {todaysTasks.filter((t: any) => t.category === 'MORNING').length === 0 && (
              <Text style={{ color: theme.textSecondary }}>No morning tasks.</Text>
            )}
            {todaysTasks.filter((t: any) => t.category === 'MORNING').map((task: any) => (
              <View key={task.id} style={styles.taskRow}>
                {task.completed ? <CheckCircle color={theme.success} size={20} /> : <Circle color={theme.textSecondary} size={20} />}
                <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
              </View>
            ))}
          </PremiumCard>

          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>{t('tasks.daytime')}</Text>
          <PremiumCard style={{ marginBottom: 16 }}>
            {todaysTasks.filter((t: any) => t.category === 'DAYTIME').length === 0 && (
              <Text style={{ color: theme.textSecondary }}>No daytime tasks.</Text>
            )}
            {todaysTasks.filter((t: any) => t.category === 'DAYTIME').map((task: any) => (
              <View key={task.id} style={styles.taskRow}>
                {task.completed ? <CheckCircle color={theme.success} size={20} /> : <Circle color={theme.textSecondary} size={20} />}
                <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
              </View>
            ))}
          </PremiumCard>

          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>{t('tasks.evening')}</Text>
          <PremiumCard style={{ marginBottom: 16 }}>
            {todaysTasks.filter((t: any) => t.category === 'EVENING').length === 0 && (
              <Text style={{ color: theme.textSecondary }}>No evening tasks.</Text>
            )}
            {todaysTasks.filter((t: any) => t.category === 'EVENING').map((task: any) => (
              <View key={task.id} style={styles.taskRow}>
                {task.completed ? <CheckCircle color={theme.success} size={20} /> : <Circle color={theme.textSecondary} size={20} />}
                <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
              </View>
            ))}
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, flex: 1, marginRight: 12 }]} 
                placeholder="Add a task..." 
                placeholderTextColor={theme.textSecondary}
                value={newTask}
                onChangeText={setNewTask}
              />
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]}>
                <Plus color="#FFF" size={20} />
                <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 4 }}>Add</Text>
              </TouchableOpacity>
            </View>
          </PremiumCard>
        </View>

        {/* Verse by Day */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Verse by Day</Text>
          <Text style={{ color: theme.textSecondary, marginBottom: 12 }}>Tap a day to read that verse</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {days.map(d => (
              <TouchableOpacity key={d} style={[styles.dayBadge, { backgroundColor: d === 17 ? theme.primary : theme.surfaceSecondary }]}>
                <Text style={{ color: d === 17 ? '#FFF' : theme.text }}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </PremiumCard>

        {/* Notes */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Notes</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
            placeholder="Write your thoughts, prayers, ideas..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
          <AnimatedButton title="Save Notes" onPress={() => {}} style={{ marginTop: 12 }} />
        </PremiumCard>

        {/* Task Calendar */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Task Calendar</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 10 }}>
            <TouchableOpacity><ChevronLeft color={theme.textSecondary} /></TouchableOpacity>
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>June 2026</Text>
            <TouchableOpacity><ChevronRight color={theme.textSecondary} /></TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            {calendarDays.map((d, i) => (
              <Text key={i} style={{ color: theme.textSecondary, width: 30, textAlign: 'center', fontWeight: 'bold' }}>{d}</Text>
            ))}
          </View>
          {/* Simple calendar grid mockup */}
          {[1, 2, 3, 4, 5].map((week) => (
            <View key={week} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((dayOffset) => {
                const day = (week - 1) * 7 + dayOffset - 1; // Approx layout
                const isCurrent = day === 17;
                return (
                  <View key={dayOffset} style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: isCurrent ? theme.primary : 'transparent', borderRadius: 15 }}>
                    {day > 0 && day <= 30 ? (
                      <Text style={{ color: isCurrent ? '#FFF' : theme.text }}>{day}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
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
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  taskTitle: { marginLeft: 12, fontSize: 16 },
  input: { padding: 12, borderRadius: Radii.input },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: Radii.input, justifyContent: 'center' },
  dayBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  textArea: { padding: 16, borderRadius: Radii.input, minHeight: 120 }
});
