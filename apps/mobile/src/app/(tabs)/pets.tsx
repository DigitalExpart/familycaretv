import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Dog, Stethoscope, Syringe, Pill, Plus, Calendar as CalendarIcon, X, AlertTriangle, FileText } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

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

  const profiles = petsData?.data || [];
  
  const [activeTab, setActiveTab] = useState('+ Add');
  
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
  const [vaccines, setVaccines] = useState([{ name: '', dateGiven: '', nextDue: '' }]);
  
  useEffect(() => {
    if (activeTab === '+ Add') {
      resetForm();
    } else {
      const pet = profiles.find((p: any) => p.name === activeTab);
      if (pet) {
        setName(pet.name || '');
        setBreed(pet.breed || '');
        setAge(pet.age || '');
        setWeight(pet.weight || '');
        setNotes(pet.notes || '');
        const vet = pet.veterinarians?.[0];
        if (vet) {
          setVetName(vet.name || '');
          setVetPhone(vet.phone || '');
        } else {
          setVetName(''); setVetPhone('');
        }
        
        setEmergencyName(''); setEmergencyPhone('');
        
        if (pet.vaccinations && pet.vaccinations.length > 0) {
          setVaccines(pet.vaccinations.map((v: any) => ({
            name: v.vaccineName, dateGiven: '', nextDue: ''
          })));
        } else {
          setVaccines([]);
        }
      }
    }
  }, [activeTab, profiles]);

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
    setVaccines([{ name: '', dateGiven: '', nextDue: '' }]);
  };

  const createPetMutation = useMutation({
    mutationFn: async (newPet: any) => {
      return await api.post('/pets', newPet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setActiveTab(name);
    }
  });

  const handleSave = () => {
    if (!name) return;
    createPetMutation.mutate({
      name,
      breed,
    });
  };

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
              {activeTab === '+ Add' ? 'New Pet' : name}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>NAME</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="Pet name" 
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>BREED</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="Goldendoodle" 
                placeholderTextColor={theme.textSecondary}
                value={breed}
                onChangeText={setBreed}
              />
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>AGE</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="e.g. 3 years" 
                placeholderTextColor={theme.textSecondary}
                value={age}
                onChangeText={setAge}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>WEIGHT</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="e.g. 65 lbs" 
                placeholderTextColor={theme.textSecondary}
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>
        </PremiumCard>

        {/* Veterinarian */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Stethoscope color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>Veterinarian</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>NAME</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="Dr. Name" 
                placeholderTextColor={theme.textSecondary}
                value={vetName}
                onChangeText={setVetName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>PHONE</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="(555) 000-0000" 
                placeholderTextColor={theme.textSecondary}
                value={vetPhone}
                onChangeText={setVetPhone}
              />
            </View>
          </View>
        </PremiumCard>

        {/* Emergency Clinic */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <AlertTriangle color={theme.error} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.error, marginLeft: 8, marginBottom: 0 }]}>Emergency Clinic</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>NAME</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} 
                placeholder="Emergency Vet" 
                placeholderTextColor={theme.textSecondary}
                value={emergencyName}
                onChangeText={setEmergencyName}
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
              />
            </View>
          </View>
        </PremiumCard>

        {/* Notes */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <FileText color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>Notes</Text>
          </View>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
            placeholder="Allergies, special conditions..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </PremiumCard>

        {/* Vaccines */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Syringe color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>Vaccines</Text>
          </View>

          {vaccines.map((vac, idx) => (
            <View key={idx} style={[styles.itemCard, { backgroundColor: theme.surfaceSecondary }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <TextInput 
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, flex: 1, height: 40 }]} 
                  value={vac.name} 
                  placeholder="Vaccine Name"
                  placeholderTextColor={theme.textSecondary}
                  onChangeText={(text) => {
                    const newVac = [...vaccines];
                    newVac[idx].name = text;
                    setVaccines(newVac);
                  }}
                />
                <TouchableOpacity 
                  style={[styles.deleteBtn, { backgroundColor: theme.surface }]}
                  onPress={() => setVaccines(vaccines.filter((_, i) => i !== idx))}
                >
                  <X color={theme.error} size={16} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>DATE GIVEN</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
                    <TextInput style={[styles.inlineInput, { color: theme.text }]} placeholder="dd/mm/yyyy" placeholderTextColor={theme.textSecondary} value={vac.dateGiven} />
                    <CalendarIcon color={theme.textSecondary} size={16} />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>NEXT DUE</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
                    <TextInput style={[styles.inlineInput, { color: theme.text }]} placeholder="dd/mm/yyyy" placeholderTextColor={theme.textSecondary} value={vac.nextDue} />
                    <CalendarIcon color={theme.textSecondary} size={16} />
                  </View>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity 
            style={[styles.outlineBtn, { borderColor: theme.warning }]}
            onPress={() => setVaccines([...vaccines, { name: '', dateGiven: '', nextDue: '' }])}
          >
            <Plus color={theme.warning} size={16} />
            <Text style={{ color: theme.warning, fontWeight: '600', marginLeft: 4 }}>Add Vaccine</Text>
          </TouchableOpacity>
        </PremiumCard>

        {/* Medications */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Pill color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>Medications</Text>
          </View>
          <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.warning }]}>
            <Plus color={theme.warning} size={16} />
            <Text style={{ color: theme.warning, fontWeight: '600', marginLeft: 4 }}>Add Medication</Text>
          </TouchableOpacity>
        </PremiumCard>

        {activeTab === '+ Add' && (
          <AnimatedButton 
            title={createPetMutation.isPending ? "Saving..." : "Save Pet"} 
            onPress={handleSave} 
            style={{ marginBottom: 20, backgroundColor: theme.warning }} 
          />
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
  label: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  input: { padding: 12, borderRadius: Radii.input, height: 48 },
  textArea: { padding: 16, borderRadius: Radii.input, minHeight: 100 },
  itemCard: { padding: 16, borderRadius: Radii.card, marginBottom: 12 },
  deleteBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: Radii.input, height: 48 },
  inlineInput: { flex: 1 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radii.card, borderWidth: 1 }
});
