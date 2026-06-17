import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useRouter, useFocusEffect } from 'expo-router';
import { Bell, Users, Pill, CalendarDays, BookOpen, UserPlus, PlayCircle } from 'lucide-react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { Badge } from '../../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

import { useDashboardStats } from '../../features/dashboard/dashboard-api';
import { useNotifications } from '../../features/notifications/notifications-api';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const [isVerseExpanded, setIsVerseExpanded] = useState(false);

  const { data: dashboardData, isLoading, refetch } = useDashboardStats();
  const { data: notificationsData } = useNotifications();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting');
    if (hour < 18) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const stats = dashboardData?.stats || {
    patients: 0,
    appointments: 0,
    medications: 0,
    notes: 0
  };

  const todaysTasks = dashboardData?.todaysTasks || [];
  const unreadNotificationsCount = notificationsData?.data?.filter((n: any) => !n.isRead)?.length || 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => {}} />}
      >
        <GradientHeader 
          title={getGreeting()} 
          subtitle={user?.firstName || user?.email?.split('@')[0] || "User"}
          rightComponent={
            <TouchableOpacity onPress={handleNotifications} style={styles.headerIconBtn}>
              <Bell color="#FFF" size={24} />
              {unreadNotificationsCount > 0 && <Badge count={unreadNotificationsCount} />}
            </TouchableOpacity>
          }
        />

        <View style={styles.body}>
          {/* Quick Stats Grid */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.quickStats')}</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity style={[styles.statBox, { backgroundColor: theme.surfaceSecondary }]} onPress={() => router.push('/patients')}>
              <Users color={theme.primary} size={28} />
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.patients}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('dashboard.patients')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.statBox, { backgroundColor: theme.surfaceSecondary }]} onPress={() => router.push('/calendar')}>
              <CalendarDays color={theme.secondary} size={28} />
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.appointments}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('dashboard.appointments')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.statBox, { backgroundColor: theme.surfaceSecondary }]} onPress={() => router.push('/patients')}>
              <Pill color={theme.accent} size={28} />
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.medications}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('dashboard.medications')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.statBox, { backgroundColor: theme.surfaceSecondary }]} onPress={() => router.push('/patients')}>
              <BookOpen color={theme.warning} size={28} />
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.notes}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('dashboard.notes')}</Text>
            </TouchableOpacity>
          </View>

          {/* Today's Priority */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.todaysTasks')}</Text>
          <PremiumCard>
            {todaysTasks.length === 0 ? (
              <View style={{ padding: 10, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary }}>No tasks scheduled for today.</Text>
              </View>
            ) : (
              todaysTasks.map((task, index) => (
                <View key={task.id}>
                  <View style={styles.taskRow}>
                    <View style={[styles.taskIconBg, { backgroundColor: task.type === 'MEDICATION' ? `${theme.accent}20` : `${theme.secondary}20` }]}>
                      {task.type === 'MEDICATION' ? (
                        <Pill color={theme.accent} size={20} />
                      ) : (
                        <CalendarDays color={theme.secondary} size={20} />
                      )}
                    </View>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskTitle, { color: theme.text }]}>{task.title} - {task.patientName}</Text>
                      <Text style={[styles.taskTime, { color: theme.textSecondary }]}>
                        {new Date(task.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  {index < todaysTasks.length - 1 && <View style={styles.divider} />}
                </View>
              ))
            )}
          </PremiumCard>

          {/* Feature Highlight: Verse of the Day (connected to Roku/TV) */}
          <PremiumCard onPress={() => {}} style={{ backgroundColor: theme.primary }}>
            {dashboardData?.verseOfTheDay ? (
              <View style={{ padding: 8 }}>
                <Text 
                  numberOfLines={isVerseExpanded ? undefined : 2}
                  style={{ color: '#FFF', fontSize: 18, fontStyle: 'italic', marginBottom: 8, lineHeight: 26 }}
                >
                  "{dashboardData.verseOfTheDay.verse}"
                </Text>
                {dashboardData.verseOfTheDay.verse.length > 80 && (
                  <TouchableOpacity onPress={() => setIsVerseExpanded(!isVerseExpanded)} style={{ marginBottom: 12 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>
                      {isVerseExpanded ? 'Show less' : 'Read more'}
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 'bold' }}>
                    - {dashboardData.verseOfTheDay.reference}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <PlayCircle color="#FFF" size={20} style={{ marginRight: 6 }} />
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Play on TV</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.highlightContent}>
                <PlayCircle color="#FFF" size={32} />
                <View style={styles.highlightText}>
                  <Text style={styles.highlightTitle}>{t('dashboard.verseOfDay')}</Text>
                  <Text style={styles.highlightSubtitle}>Play on Roku TV</Text>
                </View>
              </View>
            )}
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
