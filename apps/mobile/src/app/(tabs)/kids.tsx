import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Baby, School, CheckCircle, Circle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

export default function KidsScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { data: kidsData, isLoading } = useQuery({
    queryKey: ['kids'],
    queryFn: async () => {
      const response = await api.get('/kids');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const profiles = kidsData?.data || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('kids.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        {profiles.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Baby color={theme.textSecondary} size={48} />
            <Text style={{ color: theme.textSecondary, marginTop: 16 }}>{t('kids.noKids')}</Text>
          </View>
        ) : (
          profiles.map((profile: any) => (
            <View key={profile.id} style={{ marginBottom: 24 }}>
              <View style={styles.profileHeader}>
                <Baby color={theme.primary} size={32} />
                <Text style={[styles.profileName, { color: theme.text }]}>{profile.name}</Text>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('kids.schoolInfo')}</Text>
              <PremiumCard>
                <View style={styles.infoRow}>
                  <School color={theme.secondary} size={20} />
                  <Text style={[styles.infoText, { color: theme.text }]}>{profile.schoolName || 'N/A'}</Text>
                </View>
                <Text style={[styles.infoSubtext, { color: theme.textSecondary }]}>Grade: {profile.grade || 'N/A'}</Text>
              </PremiumCard>

              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>{t('kids.homework')}</Text>
              <PremiumCard>
                {(profile.tasks || []).length === 0 && (
                  <Text style={{ color: theme.textSecondary }}>No homework or chores.</Text>
                )}
                {(profile.tasks || []).map((task: any) => (
                  <View key={task.id} style={styles.taskRow}>
                    {task.completed ? <CheckCircle color={theme.success} size={20} /> : <Circle color={theme.textSecondary} size={20} />}
                    <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
                  </View>
                ))}
              </PremiumCard>
            </View>
          ))
        )}

        <AnimatedButton title={t('kids.addProfile')} onPress={() => {}} style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileName: { fontSize: 24, fontWeight: '700', marginLeft: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { fontSize: 16, marginLeft: 12 },
  infoSubtext: { fontSize: 14, marginLeft: 32 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  taskTitle: { marginLeft: 12, fontSize: 16 }
});
