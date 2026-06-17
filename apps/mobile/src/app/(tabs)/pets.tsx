import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Dog, Stethoscope, Syringe, Pill, Plus, Calendar as CalendarIcon, X, AlertTriangle, FileText } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export default function PetsScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState('Daly');
  const petTabs = ['Daly', 'Osa', 'Maruca', 'Tyson'];

  const { data: petsData, isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const response = await api.get('/pets');
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('pets.title') || 'Pets'} />
      
      {/* Pet Selection Tabs */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {petTabs.map(tab => (
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
          <TouchableOpacity style={[styles.tabBtn, { backgroundColor: 'transparent' }]}>
            <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>+ Add</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Pet Info */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Dog color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>{activeTab}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>NAME</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} value={activeTab} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>BREED</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="Goldendoodle" placeholderTextColor={theme.textSecondary} />
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>AGE</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="e.g. 3 years" placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>WEIGHT</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="e.g. 65 lbs" placeholderTextColor={theme.textSecondary} />
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
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="Dr. Name" placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>PHONE</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="(555) 000-0000" placeholderTextColor={theme.textSecondary} />
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
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="Emergency Vet" placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>PHONE</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text }]} placeholder="(555) 000-0000" placeholderTextColor={theme.textSecondary} />
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
          />
        </PremiumCard>

        {/* Vaccines */}
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Syringe color={theme.warning} size={20} />
            <Text style={[styles.sectionTitle, { color: theme.warning, marginLeft: 8, marginBottom: 0 }]}>Vaccines</Text>
          </View>

          {/* Rabies */}
          <View style={[styles.itemCard, { backgroundColor: theme.surfaceSecondary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TextInput style={[styles.input, { backgroundColor: theme.surface, color: theme.text, flex: 1, height: 40 }]} value="Rabies" />
              <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: theme.surface }]}>
                <X color={theme.error} size={16} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>DATE GIVEN</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
                  <TextInput style={[styles.inlineInput, { color: theme.text }]} placeholder="dd/mm/yyyy" placeholderTextColor={theme.textSecondary} />
                  <CalendarIcon color={theme.textSecondary} size={16} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>NEXT DUE</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
                  <TextInput style={[styles.inlineInput, { color: theme.text }]} placeholder="dd/mm/yyyy" placeholderTextColor={theme.textSecondary} />
                  <CalendarIcon color={theme.textSecondary} size={16} />
                </View>
              </View>
            </View>
          </View>

          {/* DHPP */}
          <View style={[styles.itemCard, { backgroundColor: theme.surfaceSecondary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TextInput style={[styles.input, { backgroundColor: theme.surface, color: theme.text, flex: 1, height: 40 }]} value="DHPP" />
              <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: theme.surface }]}>
                <X color={theme.error} size={16} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>DATE GIVEN</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
                  <TextInput style={[styles.inlineInput, { color: theme.text }]} placeholder="dd/mm/yyyy" placeholderTextColor={theme.textSecondary} />
                  <CalendarIcon color={theme.textSecondary} size={16} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>NEXT DUE</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
                  <TextInput style={[styles.inlineInput, { color: theme.text }]} placeholder="dd/mm/yyyy" placeholderTextColor={theme.textSecondary} />
                  <CalendarIcon color={theme.textSecondary} size={16} />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.warning }]}>
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
