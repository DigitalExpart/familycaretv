import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, TextInput, Platform } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Dog, Stethoscope, Syringe, Pill, Plus, Calendar as CalendarIcon, X, AlertTriangle, FileText, CheckCircle, Circle, Clock, Repeat } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { DaysOfWeekSelector } from '../../components/ui/DaysOfWeekSelector';

export default function PetsScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const queryClient = useQueryClient();

  const { data: petsData, isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const response = await api.get('/pets');
      return response.data;
    }
  });

  const profiles = Array.isArray(petsData) ? petsData : (petsData?.data || []);
  
  const [activeTab, setActiveTab] = useState('+ Add');
  const [isEditing, setIsEditing] = useState(false);
  
  const isFormEditable = activeTab === '+ Add' || isEditing;
  
  // Form State
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [vaccines, setVaccines] = useState<{ name: string, dateGiven: Date | null, nextDue: Date | null }[]>([{ name: '', dateGiven: null, nextDue: null }]);
  const [medications, setMedications] = useState<{ name: string, dosage: string }[]>([{ name: '', dosage: '' }]);
  
  // Tasks
  const [localTasks, setLocalTasks] = useState<{ id?: string, title: string, category: string, completed: boolean, date?: Date, time?: string, isDaily?: boolean, daysOfWeek?: string[] }[]>([]);
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState<Date>(new Date());
  const [taskTime, setTaskTime] = useState<Date>(new Date());
  const [isDailyTask, setIsDailyTask] = useState(false);
  const [taskDaysOfWeek, setTaskDaysOfWeek] = useState<string[]>([]);

  // Pickers
  const [openPicker, setOpenPicker] = useState<{ type: 'vaccineDateGiven' | 'vaccineNextDue' | 'taskDate' | 'taskTime', index?: number } | null>(null);

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    setIsEditing(false);
    if (activeTab === '+ Add') {
      resetForm();
    } else {
      const pet = profiles.find((p: any) => p.name === activeTab);
      if (pet) {
        setName(pet.name || '');
        setBreed(pet.breed || '');
        setAge(pet.age?.toString() || '');
        setWeight(pet.weight?.toString() || '');
        const noteObj = pet.notes?.[0];
        setNotes(noteObj?.content || '');
        const vet = pet.veterinarians?.[0];
        if (vet) {
          setVetName(vet.name || '');
          setVetPhone(vet.phone || '');
        } else {
          setVetName(''); setVetPhone('');
        }
        
        const clinic = pet.clinics?.[0];
        if (clinic) {
          setEmergencyName(clinic.name || '');
          setEmergencyPhone(clinic.phone || '');
        } else {
          setEmergencyName(''); setEmergencyPhone('');
        }
        
        if (pet.vaccinations && pet.vaccinations.length > 0) {
          setVaccines(pet.vaccinations.map((v: any) => ({
            name: v.vaccineName, 
            dateGiven: v.dateGiven ? new Date(v.dateGiven) : null, 
            nextDue: v.nextDue ? new Date(v.nextDue) : null
          })));
        } else {
          setVaccines([]);
        }

        if (pet.medications && pet.medications.length > 0) {
          setMedications(pet.medications.map((m: any) => ({
            name: m.name, dosage: m.dosage || ''
          })));
        } else {
          setMedications([]);
        }

        if (pet.tasks && pet.tasks.length > 0) {
          setLocalTasks(pet.tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            category: t.category || 'PET_CARE',
            completed: t.completed,
            date: t.date ? new Date(t.date) : undefined,
            time: t.time,
            isDaily: t.isDaily,
            daysOfWeek: t.daysOfWeek || []
          })));
        } else {
          setLocalTasks([]);
        }
      }
    }
  }, [activeTab, petsData?.data]);

  const resetForm = () => {
    setName('');
    setBreed('');
    setAge('');
    setWeight('');
    setVetName('');
    setVetPhone('');
    setEmergencyName('');
    setEmergencyPhone('');
    setNotes('');
    setVaccines([{ name: '', dateGiven: null, nextDue: null }]);
    setMedications([{ name: '', dosage: '' }]);
    setLocalTasks([]);
  };

  const createPetMutation = useMutation({
    mutationFn: async (newPet: any) => api.post('/pets', newPet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setActiveTab(name);
    }
  });

  const updatePetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => api.patch(`/pets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setIsEditing(false);
    }
  });

  const deletePetMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/pets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setActiveTab('+ Add');
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ petId, taskId, completed }: { petId: string, taskId: string, completed: boolean }) => api.patch(`/pets/${petId}/tasks/${taskId}`, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    }
  });

  const addTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => api.post(`/pets/${id}/tasks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    }
  });

  const handleSave = () => {
    if (!name) return;
    createPetMutation.mutate({
      name,
      breed,
      age: parseInt(age) || null,
      weight: parseFloat(weight) || null,
      veterinarians: vetName || vetPhone ? [{ name: vetName, phone: vetPhone }] : undefined,
      clinics: emergencyName || emergencyPhone ? [{ name: emergencyName, phone: emergencyPhone }] : undefined,
      vaccinations: vaccines.filter(v => v.name).map(v => ({
        vaccineName: v.name,
        dateGiven: v.dateGiven ? v.dateGiven.toISOString() : undefined,
        nextDue: v.nextDue ? v.nextDue.toISOString() : undefined
      })),
      medications: medications.filter(m => m.name).map(m => ({
        name: m.name,
        dosage: m.dosage
      })),
      notes: notes ? [{ content: notes }] : undefined,
      tasks: localTasks.map(t => ({
        title: t.title,
        category: t.category,
        completed: t.completed,
        date: t.date?.toISOString(),
        time: t.time,
        isDaily: t.isDaily,
        daysOfWeek: t.daysOfWeek
      }))
    });
  };

  const handleUpdate = () => {
    if (!name) return;
    const pet = profiles.find((p: any) => p.name === activeTab);
    if (!pet) return;

    updatePetMutation.mutate({
      id: pet.id,
      data: {
        name,
        breed,
        age: parseInt(age) || null,
        weight: parseFloat(weight) || null,
        veterinarians: vetName || vetPhone ? [{ name: vetName, phone: vetPhone }] : [],
        clinics: emergencyName || emergencyPhone ? [{ name: emergencyName, phone: emergencyPhone }] : [],
        vaccinations: vaccines.filter(v => v.name).map(v => ({
          vaccineName: v.name,
          dateGiven: v.dateGiven ? v.dateGiven.toISOString() : undefined,
          nextDue: v.nextDue ? v.nextDue.toISOString() : undefined
        })),
        medications: medications.filter(m => m.name).map(m => ({
          name: m.name,
          dosage: m.dosage
        })),
        notes: notes ? [{ content: notes }] : [],
        tasks: localTasks.map(t => ({
          title: t.title,
          category: t.category,
          completed: t.completed,
          date: t.date?.toISOString(),
          time: t.time,
          isDaily: t.isDaily,
          daysOfWeek: t.daysOfWeek
        }))
      }
    });
  };

  const handleDelete = () => {
    const pet = profiles.find((p: any) => p.name === activeTab);
    if (!pet) return;
    deletePetMutation.mutate(pet.id);
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const timeStr = taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (activeTab === '+ Add') {
      setLocalTasks([...localTasks, {
        title: newTask,
        category: 'PET_CARE',
        completed: false,
        date: taskDate,
        time: timeStr,
        isDaily: isDailyTask,
        daysOfWeek: taskDaysOfWeek
      }]);
      setNewTask('');
      setTaskDaysOfWeek([]);
    } else {
      const pet = profiles.find((p: any) => p.name === activeTab);
      if (pet) {
        addTaskMutation.mutate({
          id: pet.id,
          data: {
            title: newTask,
            category: 'PET_CARE',
            date: taskDate.toISOString(),
            time: timeStr,
            isDaily: isDailyTask,
            daysOfWeek: taskDaysOfWeek
          }
        });
        setNewTask('');
        setTaskDaysOfWeek([]);
      }
    }
  };

  const toggleTask = (task: any, index: number) => {
    if (activeTab === '+ Add') {
      const newTasks = [...localTasks];
      newTasks[index].completed = !newTasks[index].completed;
      setLocalTasks(newTasks);
    } else {
      const pet = profiles.find((p: any) => p.name === activeTab);
      if (pet && task.id) {
        toggleTaskMutation.mutate({ petId: pet.id, taskId: task.id, completed: !task.completed });
      }
    }
  };

  const getVisibleTasks = () => {
    const [year, month, day] = selectedCalendarDate.split('-');
    const selectedDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = dayNames[selectedDateObj.getDay()];

    return localTasks.filter((t: any) => {
      if (t.isDaily) return true;
      if (t.daysOfWeek && t.daysOfWeek.includes(selectedDayName)) return true;
      if (!t.date) return true;
      const td = new Date(t.date);
      const dateStr = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, '0')}-${String(td.getDate()).padStart(2, '0')}`;
      return dateStr === selectedCalendarDate;
    });
  };

  const visibleTasks = getVisibleTasks();

  const markedDates: any = {};
  localTasks.forEach((t: any) => {
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

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const petTabs = profiles.map((p: any) => p.name);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('pets.title') || 'Pets'} />
      
      {/* Pet Selection Tabs */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {petTabs.map((tab: string) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabBtn, 
                { backgroundColor: activeTab === tab ? theme.warning : theme.surfaceSecondary }
              ]}
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
        
        {/* Pet Info */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Dog color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>
              {activeTab === '+ Add' ? t('pets.newPet') : name}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('pets.form.name')}</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder={t('pets.form.name')} 
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
                editable={isFormEditable}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('pets.form.breed')}</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder={t('pets.form.breed')} 
                placeholderTextColor={theme.textSecondary}
                value={breed}
                onChangeText={setBreed}
                editable={isFormEditable}
              />
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('pets.form.age')}</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder={t('pets.form.age')} 
                placeholderTextColor={theme.textSecondary}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                editable={isFormEditable}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('pets.form.weight')}</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder={t('pets.form.weight')} 
                placeholderTextColor={theme.textSecondary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                editable={isFormEditable}
              />
            </View>
          </View>
        </PremiumCard>

        {/* Tasks Section */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Pet Tasks</Text>
          
          {/* Calendar */}
          <Calendar
            current={selectedCalendarDate}
            onDayPress={(day: any) => setSelectedCalendarDate(day.dateString)}
            markedDates={markedDates}
            style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden' }}
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
            }}
          />

          {visibleTasks.map((task, index) => (
            <TouchableOpacity key={task.id || index.toString()} style={styles.taskRow} onPress={() => toggleTask(task, index)}>
              {task.completed ? <CheckCircle color={theme.success} size={20} /> : <Circle color={theme.textSecondary} size={20} />}
              <Text style={[styles.taskTitle, { color: theme.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>
                {task.title} {task.time ? `(${task.time})` : ''}
              </Text>
            </TouchableOpacity>
          ))}

          {isFormEditable && (
            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text, flex: 1, marginRight: 8 }]} 
                  placeholder="Task Name"
                  placeholderTextColor={theme.textSecondary}
                  value={newTask}
                  onChangeText={setNewTask}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setOpenPicker({ type: 'taskDate' })} style={[styles.input, { flex: 1, backgroundColor: theme.surfaceSecondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }]}>
                  <CalendarIcon color={theme.textSecondary} size={16} style={{ marginRight: 8 }} />
                  <Text style={{ color: theme.text }}>{taskDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOpenPicker({ type: 'taskTime' })} style={[styles.input, { flex: 1, backgroundColor: theme.surfaceSecondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }]}>
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
                <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 4 }}>Add Task</Text>
              </TouchableOpacity>
            </View>
          )}
        </PremiumCard>

        {/* Veterinarian */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Stethoscope color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>{t('pets.vet')}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('pets.form.name')}</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="Dr. Name" 
                placeholderTextColor={theme.textSecondary}
                value={vetName}
                onChangeText={setVetName}
                editable={isFormEditable}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('pets.form.phone')}</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="(555) 000-0000" 
                placeholderTextColor={theme.textSecondary}
                value={vetPhone}
                onChangeText={setVetPhone}
                editable={isFormEditable}
              />
            </View>
          </View>
        </PremiumCard>

        {/* Emergency Clinic */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <AlertTriangle color={theme.error} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.error, marginLeft: 8, marginBottom: 0 }]}>{t('pets.emergencyClinic')}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{t('pets.form.name')}</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="Emergency Vet" 
                placeholderTextColor={theme.textSecondary}
                value={emergencyName}
                onChangeText={setEmergencyName}
                editable={isFormEditable}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>PHONE</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="(555) 000-0000" 
                placeholderTextColor={theme.textSecondary}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                editable={isFormEditable}
              />
            </View>
          </View>
        </PremiumCard>

        {/* Vaccines */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Syringe color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>{t('pets.vaccines')}</Text>
          </View>

          {vaccines.map((v, idx) => (
            <View key={idx} style={[styles.itemCard, { backgroundColor: theme.surfaceSecondary }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, flex: 1, height: 40 }]} 
                  value={v.name}
                  placeholder={t('pets.form.name')}
                  placeholderTextColor={theme.textSecondary}
                  editable={isFormEditable}
                  onChangeText={(text) => {
                    const newVacs = [...vaccines];
                    newVacs[idx].name = text;
                    setVaccines(newVacs);
                  }}
                />
                {isFormEditable && (
                  <TouchableOpacity 
                    style={[styles.deleteBtn, { backgroundColor: theme.surface }]}
                    onPress={() => setVaccines(vaccines.filter((_, i) => i !== idx))}
                  >
                    <X color={theme.error} size={16} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>{t('pets.form.dateGiven')}</Text>
                  <TouchableOpacity 
                    style={[styles.inputWrapper, { backgroundColor: theme.surface }]}
                    onPress={() => isFormEditable && setOpenPicker({ type: 'vaccineDateGiven', index: idx })}
                    disabled={!isFormEditable}
                  >
                    <Text style={{ color: v.dateGiven ? theme.text : theme.textSecondary, flex: 1 }}>
                      {v.dateGiven ? v.dateGiven.toLocaleDateString() : 'Select Date'}
                    </Text>
                    <CalendarIcon color={theme.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>{t('pets.form.nextDue')}</Text>
                  <TouchableOpacity 
                    style={[styles.inputWrapper, { backgroundColor: theme.surface }]}
                    onPress={() => isFormEditable && setOpenPicker({ type: 'vaccineNextDue', index: idx })}
                    disabled={!isFormEditable}
                  >
                    <Text style={{ color: v.nextDue ? theme.text : theme.textSecondary, flex: 1 }}>
                      {v.nextDue ? v.nextDue.toLocaleDateString() : 'Select Date'}
                    </Text>
                    <CalendarIcon color={theme.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {isFormEditable && (
            <TouchableOpacity 
              style={[styles.outlineBtn, { borderColor: theme.warning }]}
              onPress={() => setVaccines([...vaccines, { name: '', dateGiven: null, nextDue: null }])}
            >
              <Plus color={theme.warning} size={16} />
              <Text style={{ color: theme.warning, fontWeight: '600', marginLeft: 4 }}>Add Vaccine</Text>
            </TouchableOpacity>
          )}
        </PremiumCard>

        {/* Medications */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Pill color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>{t('pets.meds')}</Text>
          </View>

          {medications.map((med, idx) => (
            <View key={idx} style={[styles.itemCard, { backgroundColor: theme.surfaceSecondary }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, flex: 1, height: 40 }]} 
                  value={med.name} 
                  placeholder={t('pets.form.name')}
                  placeholderTextColor={theme.textSecondary}
                  editable={isFormEditable}
                  onChangeText={(text) => {
                    const newMeds = [...medications];
                    newMeds[idx].name = text;
                    setMedications(newMeds);
                  }}
                />
                {isFormEditable && (
                  <TouchableOpacity 
                    style={[styles.deleteBtn, { backgroundColor: theme.surface }]}
                    onPress={() => setMedications(medications.filter((_, i) => i !== idx))}
                  >
                    <X color={theme.error} size={16} />
                  </TouchableOpacity>
                )}
              </View>
              <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{t('pets.form.dosage')}</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, height: 40 }]} 
                  placeholder="e.g. 1 pill daily" 
                  placeholderTextColor={theme.textSecondary} 
                  value={med.dosage}
                  editable={isFormEditable}
                  onChangeText={(text) => {
                    const newMeds = [...medications];
                    newMeds[idx].dosage = text;
                    setMedications(newMeds);
                  }}
                />
              </View>
            </View>
          ))}

          {isFormEditable && (
            <TouchableOpacity 
              style={[styles.outlineBtn, { borderColor: theme.warning }]}
              onPress={() => setMedications([...medications, { name: '', dosage: '' }])}
            >
              <Plus color={theme.warning} size={16} />
              <Text style={{ color: theme.warning, fontWeight: '600', marginLeft: 4 }}>Add Medication</Text>
            </TouchableOpacity>
          )}
        </PremiumCard>
        
        {/* Notes */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <FileText color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>{t('pets.notes')}</Text>
          </View>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
            placeholder={t('pets.notes')}
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
            editable={isFormEditable}
          />
        </PremiumCard>

        {activeTab === '+ Add' ? (
          <AnimatedButton 
            title={createPetMutation.isPending ? t('common.loading') : t('common.save')} 
            onPress={handleSave} 
            style={{ marginBottom: 20, backgroundColor: theme.warning }} 
          />
        ) : (
          <View style={{ marginBottom: 20 }}>
            {isEditing ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <AnimatedButton 
                  title={updatePetMutation.isPending ? t('common.loading') : t('common.save')} 
                  onPress={handleUpdate} 
                  style={{ flex: 1, backgroundColor: theme.warning }} 
                />
                <AnimatedButton 
                  title={t('common.cancel')} 
                  onPress={() => { setIsEditing(false); }} 
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
                  title={deletePetMutation.isPending ? t('common.loading') : t('common.delete')} 
                  onPress={handleDelete} 
                  style={{ flex: 1, backgroundColor: theme.error }} 
                />
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Global DateTimePicker */}
      {openPicker && (
        <DateTimePicker
          value={
            openPicker.type === 'taskDate' ? taskDate :
            openPicker.type === 'taskTime' ? taskTime :
            openPicker.type === 'vaccineDateGiven' ? (vaccines[openPicker.index!].dateGiven || new Date()) :
            (vaccines[openPicker.index!].nextDue || new Date())
          }
          mode={openPicker.type === 'taskTime' ? 'time' : 'date'}
          display="default"
          onChange={(event, selectedDate) => {
            const picker = openPicker;
            setOpenPicker(null);
            if (selectedDate) {
              if (picker.type === 'taskDate') setTaskDate(selectedDate);
              else if (picker.type === 'taskTime') setTaskTime(selectedDate);
              else if (picker.type === 'vaccineDateGiven') {
                const newVacs = [...vaccines];
                newVacs[picker.index!].dateGiven = selectedDate;
                setVaccines(newVacs);
              }
              else if (picker.type === 'vaccineNextDue') {
                const newVacs = [...vaccines];
                newVacs[picker.index!].nextDue = selectedDate;
                setVaccines(newVacs);
              }
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  input: { padding: 12, borderRadius: Radii.input, height: 48 },
  textArea: { padding: 16, borderRadius: Radii.input, minHeight: 100 },
  itemCard: { padding: 16, borderRadius: Radii.card, marginBottom: 12 },
  deleteBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: Radii.input, height: 48 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radii.card, borderWidth: 1 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  taskTitle: { marginLeft: 12, fontSize: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: Radii.input, height: 48, justifyContent: 'center' },
});
