import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, TextInput, Dimensions, Alert } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Baby, School, CheckCircle, Circle, Plus, ChevronLeft, ChevronRight, PawPrint, FileText, Calendar as CalendarIcon, Clock, Repeat, Trash2 } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { DaysOfWeekSelector } from '../../components/ui/DaysOfWeekSelector';

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
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date(new Date().setHours(8, 0, 0, 0)));
  const [endTime, setEndTime] = useState<Date>(new Date(new Date().setHours(15, 0, 0, 0)));
  const [bus, setBus] = useState('');
  const [notes, setNotes] = useState('');
  const [newTask, setNewTask] = useState('');
  const [taskCategory, setTaskCategory] = useState<'CHORE' | 'HOMEWORK'>('CHORE');
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

  const [localTasks, setLocalTasks] = useState<{ id: string, title: string, category: string, completed: boolean, date?: Date, time?: string, isDaily?: boolean, daysOfWeek?: string[] }[]>([]);

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
      setLocalTasks([]);
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
  const allTasks = activeTab === '+ Add' ? localTasks : (activeProfile?.tasks || []);
  
  // Filter tasks based on selectedCalendarDate
  const tasks = allTasks.filter((t: any) => {
    if (t.isDaily) return true;
    
    const d = new Date();
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

  const chores = tasks.filter((t: any) => t.category === 'CHORE');
  const homework = tasks.filter((t: any) => t.category === 'HOMEWORK');

  // Mutations
  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => api.post('/kids', data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      setActiveTab(variables.name || 'New Kid');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create kid profile');
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => api.patch(`/kids/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update kid profile');
    }
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/kids/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] });
      setActiveTab('+ Add');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete kid profile');
    }
  });

  const addTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => api.post(`/kids/${id}/tasks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add task');
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ kidId, taskId, completed }: { kidId: string, taskId: string, completed: boolean }) => 
      api.patch(`/kids/${kidId}/tasks/${taskId}`, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update task');
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async ({ kidId, taskId }: { kidId: string, taskId: string }) => 
      api.delete(`/kids/${kidId}/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete task');
    }
  });

  const handleSave = () => {
    if (!name) return;
    const payload: any = {
      name, schoolName, grade, teacherPhone: phone, teacher, schoolHours: hours, busNumber: bus,
      notes: notes ? [{ content: notes }] : []
    };
    if (activeTab === '+ Add') {
      payload.tasks = localTasks.map(t => ({ 
        title: t.title, 
        category: t.category, 
        completed: t.completed, 
        daysOfWeek: t.daysOfWeek,
        time: t.time,
        date: t.date,
        isDaily: t.isDaily
      }));
      createProfileMutation.mutate(payload);
    } else if (activeProfile) {
      updateProfileMutation.mutate({ id: activeProfile.id, data: payload });
    }
  };

  const handleDelete = () => {
    if (activeProfile) deleteProfileMutation.mutate(activeProfile.id);
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const timeStr = `${taskTime.getHours().toString().padStart(2, '0')}:${taskTime.getMinutes().toString().padStart(2, '0')}`;
    if (activeTab === '+ Add') {
      setLocalTasks([...localTasks, { 
        id: Date.now().toString(), 
        title: newTask, 
        category: taskCategory, 
        completed: false,
        date: taskDate,
        time: timeStr,
        isDaily: isDailyTask,
        daysOfWeek: taskDaysOfWeek
      }]);
      setNewTask('');
      setTaskDaysOfWeek([]);
    } else if (activeProfile) {
      if (!isDailyTask && taskDaysOfWeek.length === 0) {
         const dStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
         setSelectedCalendarDate(dStr);
      }
      addTaskMutation.mutate({
        id: activeProfile.id,
        data: { 
          title: newTask, 
          category: taskCategory,
          date: taskDate.toISOString(),
          time: timeStr,
          isDaily: isDailyTask,
          daysOfWeek: taskDaysOfWeek
        }
      });
      setNewTask('');
      setTaskDaysOfWeek([]);
    }
  };

  const handleToggleTask = (task: any) => {
    if (activeTab === '+ Add') {
      setLocalTasks(localTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
    } else if (activeProfile) {
      toggleTaskMutation.mutate({ kidId: activeProfile.id, taskId: task.id, completed: !task.completed });
    }
  };

  const handleDeleteTask = (task: any) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            if (activeTab === '+ Add') {
              setLocalTasks(localTasks.filter(t => t.id !== task.id));
            } else if (activeProfile) {
              deleteTaskMutation.mutate({ kidId: activeProfile.id, taskId: task.id });
            }
          }
        }
      ]
    );
  };

  // Calendar marked dates
  const markedDates: any = {};
  allTasks.forEach((t: any) => {
    if (t.date && !t.isDaily) {
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
            <Text style={{ color: activeTab === '+ Add' ? '#FFF' : theme.textSecondary, fontWeight: '600' }}>{t('common.add', '+ Add')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* School Information Form */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <School color={theme.secondary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.secondary, marginLeft: 8, marginBottom: 0 }]}>
              {activeTab === '+ Add' ? t('kids.schoolInfo') : `${name} - ${t('kids.schoolInfo')}`}
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
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.hours', 'HOURS').toUpperCase()}</Text>
              <TouchableOpacity 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, justifyContent: 'center' }]}
                disabled={!isFormEditable}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={{ color: hours ? theme.text : theme.textSecondary }}>{hours || "8AM - 3PM"}</Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    setShowStartTimePicker(false);
                    if (selectedDate) {
                      setStartTime(selectedDate);
                      setShowEndTimePicker(true);
                    }
                  }}
                  onDismiss={() => setShowStartTimePicker(false)}
                />
              )}
              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    setShowEndTimePicker(false);
                    if (selectedDate) {
                      setEndTime(selectedDate);
                      const startStr = startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(' ', '');
                      const endStr = selectedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(' ', '');
                      setHours(`${startStr} - ${endStr}`);
                    }
                  }}
                  onDismiss={() => setShowEndTimePicker(false)}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('kids.form.bus', 'BUS').toUpperCase()}</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder={t('kids.form.busPlaceholder', 'Bus #')} placeholderTextColor={theme.textSecondary} value={bus} onChangeText={setBus} editable={isFormEditable} />
            </View>
          </View>
        </PremiumCard>

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

              <Text style={[styles.subTitle, { color: theme.textSecondary }]}>{t('kids.chores', 'CHORES')}</Text>
              <View style={{ marginBottom: 16 }}>
                {chores.length === 0 && <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }}>{t('kids.noChores', 'No chores added.')}</Text>}
                {chores.map((task: any) => (
                  <View key={task.id} style={[styles.taskRow, { justifyContent: 'space-between' }]}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => handleToggleTask(task)}>
                      {task.completed ? <CheckCircle color={theme.success} size={20} /> : <Circle color={theme.textSecondary} size={20} />}
                      <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>
                        {task.title}
                        {task.time ? ` (${task.time})` : ''}
                        <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                          {task.isDaily ? ' - Everyday' : (task.daysOfWeek && task.daysOfWeek.length > 0 ? ` - ${task.daysOfWeek.map((d: string) => d.substring(0,3)).join(', ')}` : '')}
                        </Text>
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteTask(task)} style={{ padding: 8 }}>
                      <Trash2 color={theme.danger || '#EF4444'} size={18} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <Text style={[styles.subTitle, { color: theme.textSecondary }]}>{t('kids.homeworkTab', 'HOMEWORK')}</Text>
              <View style={{ marginBottom: 16 }}>
                {homework.length === 0 && <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }}>{t('kids.noHomework', 'No homework added.')}</Text>}
                {homework.map((task: any) => (
                  <View key={task.id} style={[styles.taskRow, { justifyContent: 'space-between' }]}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => handleToggleTask(task)}>
                      {task.completed ? <CheckCircle color={theme.success} size={20} /> : <Circle color={theme.textSecondary} size={20} />}
                      <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>
                        {task.title}
                        {task.time ? ` (${task.time})` : ''}
                        <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                          {task.isDaily ? ' - Everyday' : (task.daysOfWeek && task.daysOfWeek.length > 0 ? ` - ${task.daysOfWeek.map((d: string) => d.substring(0,3)).join(', ')}` : '')}
                        </Text>
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteTask(task)} style={{ padding: 8 }}>
                      <Trash2 color={theme.danger || '#EF4444'} size={18} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setTaskCategory('CHORE')} style={[styles.categoryBtn, { backgroundColor: taskCategory === 'CHORE' ? theme.warning : theme.surfaceSecondary }]}>
                  <Text style={{ color: taskCategory === 'CHORE' ? '#FFF' : theme.text }}>{t('kids.chore', 'Chore')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTaskCategory('HOMEWORK')} style={[styles.categoryBtn, { backgroundColor: taskCategory === 'HOMEWORK' ? theme.warning : theme.surfaceSecondary }]}>
                  <Text style={{ color: taskCategory === 'HOMEWORK' ? '#FFF' : theme.text }}>{t('kids.homework', 'Homework')}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 12 }}>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text, flex: 1, marginBottom: 8 }]} 
                  placeholder={taskCategory === 'CHORE' ? t('kids.addChore', 'Add a chore...') : t('kids.addHomework')} 
                  placeholderTextColor={theme.textSecondary}
                  value={newTask}
                  onChangeText={setNewTask}
                />
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
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
                <TouchableOpacity onPress={handleAddTask} style={[styles.addBtn, { backgroundColor: theme.warning }]}>
                  <Plus color="#FFF" size={20} />
                  <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 4 }}>{t('common.add')}</Text>
                </TouchableOpacity>
              </View>

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

            {/* Kids Calendar */}
            <PremiumCard style={{ marginBottom: 20 }}>
              <Text style={[styles.sectionTitle, { color: theme.warning, marginBottom: 12 }]}>{t('kids.calendar')}</Text>
              <Calendar
                key={isDark ? 'dark' : 'light'}
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

        {/* Kids Notes */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <FileText color={theme.secondary} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.secondary, marginLeft: 8, marginBottom: 0 }]}>
              {t('kids.form.notes', 'Notes')}
            </Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.surfaceSecondary, color: theme.text, height: 120 }]}
            placeholder={t('kids.form.addNote', 'Add a note...')}
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            editable={isFormEditable}
            textAlignVertical="top"
          />
        </PremiumCard>

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
                  variant="danger"
                  style={{ flex: 1 }} 
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
