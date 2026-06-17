import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Baby, School, CheckCircle, Circle, Plus, ChevronLeft, ChevronRight, PawPrint } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export default function KidsScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const [newTask, setNewTask] = useState('');
  const [notes, setNotes] = useState('');

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

  const profiles = Array.isArray(kidsData) ? kidsData : (kidsData?.data || []);
  const calendarDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Use the first profile for the mockup if available, else a default structure
  const profile = profiles[0] || {
    id: '1',
    name: 'Child Profile',
    schoolName: '',
    grade: '',
    tasks: []
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('kids.title') || 'Kids'} />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* School Information Form */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <School color={theme.secondary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.secondary, marginLeft: 8, marginBottom: 0 }]}>{t('kids.schoolInfo')}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.schoolName').toUpperCase()}</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder={t('kids.form.schoolName')} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.grade').toUpperCase()}</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder={t('kids.form.grade')} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.phone').toUpperCase()}</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="(555) 000-0000" placeholderTextColor={theme.textSecondary} />
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.teacher').toUpperCase()}</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder={t('kids.form.teacher')} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>HOURS</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="8AM - 3PM" placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>BUS</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="Bus #" placeholderTextColor={theme.textSecondary} />
            </View>
          </View>
          
          <AnimatedButton title="Save" onPress={() => {}} style={{ width: 100 }} />
        </PremiumCard>

        {/* Costumes Highlight */}
        <PremiumCard style={{ marginBottom: 20, alignItems: 'center', paddingVertical: 30, backgroundColor: theme.surfaceSecondary }}>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <PawPrint color="#F59E0B" size={32} />
            <PawPrint color="#F59E0B" size={32} style={{ marginTop: -10, marginLeft: -10 }} />
          </View>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600' }}>Dog and Cat Costumes</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>by Eyben Colon</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8 }}>Images coming soon</Text>
        </PremiumCard>

        {/* Kids Tasks */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Baby color={theme.warning} size={20} />
              <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>{t('kids.homework')}</Text>
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>1/5</Text>
          </View>

          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>CHORES</Text>
          <View style={{ marginBottom: 16 }}>
            {/* Mock Chores */}
            <View style={styles.taskRow}>
              <CheckCircle color={theme.success} size={20} />
              <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: 'line-through' }]}>Make bed</Text>
            </View>
            <View style={styles.taskRow}>
              <Circle color={theme.textSecondary} size={20} />
              <Text style={[styles.taskTitle, { color: theme.text }]}>Tidy room</Text>
            </View>
            <View style={styles.taskRow}>
              <Circle color={theme.textSecondary} size={20} />
              <Text style={[styles.taskTitle, { color: theme.text }]}>Feed the pet</Text>
            </View>
          </View>

          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>HOMEWORK</Text>
          <View style={{ marginBottom: 16 }}>
            {/* Mock Homework */}
            <View style={styles.taskRow}>
              <Circle color={theme.textSecondary} size={20} />
              <Text style={[styles.taskTitle, { color: theme.text }]}>Math homework</Text>
            </View>
            <View style={styles.taskRow}>
              <Circle color={theme.textSecondary} size={20} />
              <Text style={[styles.taskTitle, { color: theme.text }]}>Reading 20 min</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text, flex: 1, marginRight: 12 }]} 
              placeholder={t('kids.addHomework')} 
              placeholderTextColor={theme.textSecondary}
              value={newTask}
              onChangeText={setNewTask}
            />
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.warning }]}>
              <Plus color="#FFF" size={20} />
              <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 4 }}>{t('common.add')}</Text>
            </TouchableOpacity>
          </View>
        </PremiumCard>

        {/* Kids Calendar */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.warning }]}>{t('kids.calendar')}</Text>
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
                  <View key={dayOffset} style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: isCurrent ? theme.warning : 'transparent', borderRadius: 15 }}>
                    {day > 0 && day <= 30 ? (
                      <Text style={{ color: isCurrent ? '#FFF' : theme.text }}>{day}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </PremiumCard>

        {/* Notes */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>{t('notes.title')}</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
            placeholder="School notes, reminders..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
          <AnimatedButton title="Save Notes" onPress={() => {}} style={{ marginTop: 12 }} />
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
  label: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  input: { padding: 12, borderRadius: Radii.input, height: 48 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  taskTitle: { marginLeft: 12, fontSize: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: Radii.input, height: 48, justifyContent: 'center' },
  textArea: { padding: 16, borderRadius: Radii.input, minHeight: 120 }
});
