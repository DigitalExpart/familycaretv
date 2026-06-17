import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, TextInput, Dimensions, Alert } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Baby, School, CheckCircle, Circle, Plus, ChevronLeft, ChevronRight, PawPrint } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

const { width } = Dimensions.get('window');

export default function KidsScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const queryClient = useQueryClient();

  const { data: kidsData, isLoading } = useQuery({
    queryKey: ['kids'],
    queryFn: async () => {
      const response = await api.get('/kids');
      return response.data;
    }
  });

  const profiles = Array.isArray(kidsData) ? kidsData : (kidsData?.data || []);
  
  const [activeTab, setActiveTab] = useState('+ Add');
  const [isEditing, setIsEditing] = useState(false);
  const isFormEditable = activeTab === '+ Add' || isEditing;

  // Form State
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');
  const [phone, setPhone] = useState('');
  const [teacher, setTeacher] = useState('');
  const [hours, setHours] = useState('');
  const [bus, setBus] = useState('');
  const [notes, setNotes] = useState('');
  const [newTask, setNewTask] = useState('');
  const [taskCategory, setTaskCategory] = useState<'CHORE' | 'HOMEWORK'>('CHORE');

  useEffect(() => {
    setIsEditing(false);
    if (activeTab === '+ Add') {
      setName('');
      setSchoolName('');
      setGrade('');
      setPhone('');
      setTeacher('');
      setHours('');
      setBus('');
      setNotes('');
    } else {
      const kid = profiles.find((p: any) => p.name === activeTab);
      if (kid) {
        setName(kid.name || '');
        setSchoolName(kid.schoolName || '');
        setGrade(kid.grade || '');
        setPhone(kid.teacherPhone || '');
        setTeacher(kid.teacher || '');
        setHours(kid.schoolHours || '');
        setBus(kid.busNumber || '');
        const noteObj = kid.notes?.[0];
        setNotes(noteObj?.content || '');
      }
    }
  }, [activeTab, kidsData]);

  const activeProfile = profiles.find((p: any) => p.name === activeTab);
  const tasks = activeProfile?.tasks || [];
  const chores = tasks.filter((t: any) => t.category === 'CHORE');
  const homework = tasks.filter((t: any) => t.category === 'HOMEWORK');

  // Mutations
  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => api.post('/kids', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      setActiveTab(name);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => api.patch(`/kids/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      setIsEditing(false);
    }
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/kids/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      setActiveTab('+ Add');
    }
  });

  const addTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => api.post(`/kids/${id}/tasks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      setNewTask('');
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ kidId, taskId, completed }: { kidId: string, taskId: string, completed: boolean }) => 
      api.patch(`/kids/${kidId}/tasks/${taskId}`, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kids'] })
  });

  const handleSave = () => {
    if (!name) return;
    const payload = {
      name, schoolName, grade, teacherPhone: phone, teacher, schoolHours: hours, busNumber: bus,
      notes: notes ? [{ content: notes }] : []
    };
    if (activeTab === '+ Add') {
      createProfileMutation.mutate(payload);
    } else if (activeProfile) {
      updateProfileMutation.mutate({ id: activeProfile.id, data: payload });
    }
  };

  const handleDelete = () => {
    if (activeProfile) deleteProfileMutation.mutate(activeProfile.id);
  };

  const handleAddTask = () => {
    if (!newTask.trim() || !activeProfile) return;
    addTaskMutation.mutate({
      id: activeProfile.id,
      data: { title: newTask, category: taskCategory }
    });
  };

  // Calendar Logic (Responsive to current month)
  const today = new Date();
  const currentMonthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const calendarDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Build grid
  const daysGrid = [];
  let currentWeek = [];
  for (let i = 0; i < firstDayOfMonth; i++) currentWeek.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    currentWeek.push(i);
    if (currentWeek.length === 7) {
      daysGrid.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    daysGrid.push(currentWeek);
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const kidTabs = profiles.map((p: any) => p.name);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('kids.title') || 'Kids Hub'} />
      
      {/* Tabs */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {kidTabs.map((tab: string) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[styles.tabBtn, { backgroundColor: activeTab === tab ? theme.warning : theme.surfaceSecondary }]}
            >
              <Text style={{ color: activeTab === tab ? '#FFF' : theme.textSecondary, fontWeight: '600' }}>{tab}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            onPress={() => setActiveTab('+ Add')}
            style={[styles.tabBtn, { backgroundColor: activeTab === '+ Add' ? theme.warning : 'transparent' }]}
          >
            <Text style={{ color: activeTab === '+ Add' ? '#FFF' : theme.textSecondary, fontWeight: '600' }}>+ Add</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* School Information Form */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <School color={theme.secondary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.secondary, marginLeft: 8, marginBottom: 0 }]}>
              {activeTab === '+ Add' ? t('kids.schoolInfo') : `${name}'s ${t('kids.schoolInfo')}`}
            </Text>
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.name').toUpperCase()}</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
              placeholder={t('kids.form.name')} 
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              editable={isFormEditable}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.schoolName').toUpperCase()}</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder={t('kids.form.schoolName')} placeholderTextColor={theme.textSecondary} value={schoolName} onChangeText={setSchoolName} editable={isFormEditable} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.grade').toUpperCase()}</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder={t('kids.form.grade')} placeholderTextColor={theme.textSecondary} value={grade} onChangeText={setGrade} editable={isFormEditable} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.phone').toUpperCase()}</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="(555) 000-0000" placeholderTextColor={theme.textSecondary} value={phone} onChangeText={setPhone} editable={isFormEditable} />
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.teacher').toUpperCase()}</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder={t('kids.form.teacher')} placeholderTextColor={theme.textSecondary} value={teacher} onChangeText={setTeacher} editable={isFormEditable} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>HOURS</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="8AM - 3PM" placeholderTextColor={theme.textSecondary} value={hours} onChangeText={setHours} editable={isFormEditable} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>BUS</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="Bus #" placeholderTextColor={theme.textSecondary} value={bus} onChangeText={setBus} editable={isFormEditable} />
            </View>
          </View>
        </PremiumCard>

        {activeTab !== '+ Add' && (
          <>
            {/* Kids Tasks */}
            <PremiumCard style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Baby color={theme.warning} size={20} />
                  <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>{t('kids.homework')}</Text>
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {tasks.filter((t: any) => t.completed).length}/{tasks.length}
                </Text>
              </View>

              <Text style={[styles.subTitle, { color: theme.textSecondary }]}>CHORES</Text>
              <View style={{ marginBottom: 16 }}>
                {chores.length === 0 && <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }}>No chores added.</Text>}
                {chores.map((task: any) => (
                  <TouchableOpacity key={task.id} style={styles.taskRow} onPress={() => toggleTaskMutation.mutate({ kidId: activeProfile.id, taskId: task.id, completed: !task.completed })}>
                    {task.completed ? <CheckCircle color={theme.success} size={20} /> : <Circle color={theme.textSecondary} size={20} />}
                    <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.subTitle, { color: theme.textSecondary }]}>HOMEWORK</Text>
              <View style={{ marginBottom: 16 }}>
                {homework.length === 0 && <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }}>No homework added.</Text>}
                {homework.map((task: any) => (
                  <TouchableOpacity key={task.id} style={styles.taskRow} onPress={() => toggleTaskMutation.mutate({ kidId: activeProfile.id, taskId: task.id, completed: !task.completed })}>
                    {task.completed ? <CheckCircle color={theme.success} size={20} /> : <Circle color={theme.textSecondary} size={20} />}
                    <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setTaskCategory('CHORE')} style={[styles.categoryBtn, { backgroundColor: taskCategory === 'CHORE' ? theme.warning : theme.surfaceSecondary }]}>
                  <Text style={{ color: taskCategory === 'CHORE' ? '#FFF' : theme.text }}>Chore</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTaskCategory('HOMEWORK')} style={[styles.categoryBtn, { backgroundColor: taskCategory === 'HOMEWORK' ? theme.warning : theme.surfaceSecondary }]}>
                  <Text style={{ color: taskCategory === 'HOMEWORK' ? '#FFF' : theme.text }}>Homework</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text, flex: 1, marginRight: 12 }]} 
                  placeholder={taskCategory === 'CHORE' ? "Add a chore..." : t('kids.addHomework')} 
                  placeholderTextColor={theme.textSecondary}
                  value={newTask}
                  onChangeText={setNewTask}
                />
                <TouchableOpacity onPress={handleAddTask} style={[styles.addBtn, { backgroundColor: theme.warning }]}>
                  <Plus color="#FFF" size={20} />
                  <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 4 }}>{t('common.add')}</Text>
                </TouchableOpacity>
              </View>
            </PremiumCard>

            {/* Kids Calendar */}
            <PremiumCard style={{ marginBottom: 20 }}>
              <Text style={[styles.sectionTitle, { color: theme.warning }]}>{t('kids.calendar')}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16, paddingHorizontal: 10 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{currentMonthName}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                {calendarDays.map((d, i) => (
                  <Text key={i} style={{ color: theme.textSecondary, width: 30, textAlign: 'center', fontWeight: 'bold' }}>{d}</Text>
                ))}
              </View>
              {daysGrid.map((week, wIndex) => (
                <View key={wIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  {week.map((day, dIndex) => {
                    const isCurrent = day === today.getDate();
                    return (
                      <View key={dIndex} style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: isCurrent ? theme.warning : 'transparent', borderRadius: 15 }}>
                        {day ? <Text style={{ color: isCurrent ? '#FFF' : theme.text }}>{day}</Text> : null}
                      </View>
                    );
                  })}
                </View>
              ))}
            </PremiumCard>
          </>
        )}

        {/* Save/Edit/Delete Actions */}
        {activeTab === '+ Add' ? (
          <AnimatedButton 
            title={createProfileMutation.isPending ? t('common.loading') : t('common.save')} 
            onPress={handleSave} 
            style={{ marginBottom: 20, backgroundColor: theme.warning }} 
          />
        ) : (
          <View style={{ marginBottom: 20 }}>
            {isEditing ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <AnimatedButton 
                  title={updateProfileMutation.isPending ? t('common.loading') : t('common.save')} 
                  onPress={handleSave} 
                  style={{ flex: 1, backgroundColor: theme.warning }} 
                />
                <AnimatedButton 
                  title={t('common.cancel')} 
                  onPress={() => setIsEditing(false)} 
                  style={{ flex: 1, backgroundColor: theme.surfaceSecondary }} 
                  textStyle={{ color: theme.text }}
                />
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <AnimatedButton 
                  title={t('common.edit')} 
                  onPress={() => setIsEditing(true)} 
                  style={{ flex: 1, backgroundColor: theme.primary }} 
                />
                <AnimatedButton 
                  title={deleteProfileMutation.isPending ? t('common.loading') : t('common.delete')} 
                  onPress={handleDelete} 
                  style={{ flex: 1, backgroundColor: theme.error }} 
                />
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  subTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  label: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  input: { padding: 12, borderRadius: Radii.input, height: 48 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  taskTitle: { marginLeft: 12, fontSize: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: Radii.input, height: 48, justifyContent: 'center' },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  textArea: { padding: 16, borderRadius: Radii.input, minHeight: 120 }
});
