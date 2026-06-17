import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { CheckCircle, Circle } from 'lucide-react-native';
import { useDashboardStats } from '../../features/dashboard/dashboard-api';

export default function TasksScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { data: dashboardData } = useDashboardStats();

  const todaysTasks = dashboardData?.todaysTasks || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('tasks.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('tasks.morning')}</Text>
        <PremiumCard>
          {todaysTasks.filter((t: any) => t.category === 'MORNING').length === 0 && (
            <Text style={{ color: theme.textSecondary }}>No morning tasks.</Text>
          )}
          {todaysTasks.filter((t: any) => t.category === 'MORNING').map((task: any) => (
            <View key={task.id} style={styles.taskRow}>
              {task.completed ? <CheckCircle color={theme.success} /> : <Circle color={theme.textSecondary} />}
              <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
            </View>
          ))}
        </PremiumCard>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>{t('tasks.daytime')}</Text>
        <PremiumCard>
          {todaysTasks.filter((t: any) => t.category === 'DAYTIME').length === 0 && (
            <Text style={{ color: theme.textSecondary }}>No daytime tasks.</Text>
          )}
          {todaysTasks.filter((t: any) => t.category === 'DAYTIME').map((task: any) => (
            <View key={task.id} style={styles.taskRow}>
              {task.completed ? <CheckCircle color={theme.success} /> : <Circle color={theme.textSecondary} />}
              <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
            </View>
          ))}
        </PremiumCard>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>{t('tasks.evening')}</Text>
        <PremiumCard>
          {todaysTasks.filter((t: any) => t.category === 'EVENING').length === 0 && (
            <Text style={{ color: theme.textSecondary }}>No evening tasks.</Text>
          )}
          {todaysTasks.filter((t: any) => t.category === 'EVENING').map((task: any) => (
            <View key={task.id} style={styles.taskRow}>
              {task.completed ? <CheckCircle color={theme.success} /> : <Circle color={theme.textSecondary} />}
              <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
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
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  taskTitle: { marginLeft: 12, fontSize: 16 }
});
