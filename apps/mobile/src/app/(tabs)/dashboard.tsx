import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useRouter } from 'expo-router';
import { Bell, Users, Pill, CalendarDays, BookOpen, UserPlus, PlayCircle } from 'lucide-react';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { Badge } from '../../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting');
    if (hour < 18) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
      >
        <GradientHeader 
          title={getGreeting()} 
          subtitle={user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
          rightComponent={
            <TouchableOpacity onPress={handleNotifications} style={styles.headerIconBtn}>
              <Bell color="#FFF" size={24} />
              <Badge count={3} />
            </TouchableOpacity>
          }
        />

        <View style={styles.body}>
          {/* Quick Stats Grid */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.quickStats')}</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity style={[styles.statBox, { backgroundColor: theme.surfaceSecondary }]} onPress={() => router.push('/patients')}>
              <Users color={theme.primary} size={28} />
              <Text style={[styles.statValue, { color: theme.text }]}>4</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('dashboard.patients')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.statBox, { backgroundColor: theme.surfaceSecondary }]} onPress={() => router.push('/calendar')}>
              <CalendarDays color={theme.secondary} size={28} />
              <Text style={[styles.statValue, { color: theme.text }]}>2</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('dashboard.appointments')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.statBox, { backgroundColor: theme.surfaceSecondary }]} onPress={() => router.push('/patients')}>
              <Pill color={theme.accent} size={28} />
              <Text style={[styles.statValue, { color: theme.text }]}>6</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('dashboard.medications')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.statBox, { backgroundColor: theme.surfaceSecondary }]} onPress={() => router.push('/patients')}>
              <BookOpen color={theme.warning} size={28} />
              <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('dashboard.notes')}</Text>
            </TouchableOpacity>
          </View>

          {/* Today's Priority */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.todaysTasks')}</Text>
          <PremiumCard>
            <View style={styles.taskRow}>
              <View style={[styles.taskIconBg, { backgroundColor: `${theme.accent}20` }]}>
                <Pill color={theme.accent} size={20} />
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, { color: theme.text }]}>Aspirin 100mg - John Doe</Text>
                <Text style={[styles.taskTime, { color: theme.textSecondary }]}>8:00 AM (Overdue)</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.taskRow}>
              <View style={[styles.taskIconBg, { backgroundColor: `${theme.secondary}20` }]}>
                <CalendarDays color={theme.secondary} size={20} />
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, { color: theme.text }]}>Checkup - Dr. Smith</Text>
                <Text style={[styles.taskTime, { color: theme.textSecondary }]}>2:30 PM</Text>
              </View>
            </View>
          </PremiumCard>

          {/* Feature Highlight: Verse of the Day (connected to Roku/TV) */}
          <PremiumCard onPress={() => {}} style={{ backgroundColor: theme.primary }}>
            <View style={styles.highlightContent}>
              <PlayCircle color="#FFF" size={32} />
              <View style={styles.highlightText}>
                <Text style={styles.highlightTitle}>{t('dashboard.verseOfDay')}</Text>
                <Text style={styles.highlightSubtitle}>Play on Roku TV</Text>
              </View>
            </View>
          </PremiumCard>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.quickActions')}</Text>
          <AnimatedButton 
            title={t('dashboard.addPatient')} 
            onPress={() => router.push('/patients/create')} 
            style={styles.actionBtn} 
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerIconBtn: {
    padding: 8,
    position: 'relative',
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    width: '48%',
    padding: 16,
    borderRadius: Radii.card,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  taskIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  highlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    marginLeft: 16,
  },
  highlightTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  highlightSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  actionBtn: {
    marginBottom: 12,
  },
});
