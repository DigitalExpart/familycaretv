import React from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Dog, Stethoscope, Syringe, Pill } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export default function PetsScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

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

  const profiles = petsData?.data || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('pets.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        {profiles.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Dog color={theme.textSecondary} size={48} />
            <Text style={{ color: theme.textSecondary, marginTop: 16 }}>{t('pets.noPets')}</Text>
          </View>
        ) : (
          profiles.map((profile: any) => (
            <View key={profile.id} style={{ marginBottom: 24 }}>
              <View style={styles.profileHeader}>
                <Dog color={theme.primary} size={32} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.profileName, { color: theme.text }]}>{profile.name}</Text>
                  <Text style={{ color: theme.textSecondary }}>{profile.breed || 'Unknown breed'}</Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('pets.vet')}</Text>
              <PremiumCard>
                {(profile.veterinarians || []).length === 0 && <Text style={{ color: theme.textSecondary }}>No vet added.</Text>}
                {(profile.veterinarians || []).map((vet: any) => (
                  <View key={vet.id} style={styles.infoRow}>
                    <Stethoscope color={theme.secondary} size={20} />
                    <Text style={[styles.infoText, { color: theme.text }]}>{vet.name} - {vet.phone}</Text>
                  </View>
                ))}
              </PremiumCard>

              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>{t('pets.vaccines')}</Text>
              <PremiumCard>
                {(profile.vaccinations || []).length === 0 && <Text style={{ color: theme.textSecondary }}>No vaccinations recorded.</Text>}
                {(profile.vaccinations || []).map((vac: any) => (
                  <View key={vac.id} style={styles.infoRow}>
                    <Syringe color={theme.accent} size={20} />
                    <Text style={[styles.infoText, { color: theme.text }]}>{vac.vaccineName}</Text>
                  </View>
                ))}
              </PremiumCard>

              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>{t('pets.meds')}</Text>
              <PremiumCard>
                {(profile.medications || []).length === 0 && <Text style={{ color: theme.textSecondary }}>No medications.</Text>}
                {(profile.medications || []).map((med: any) => (
                  <View key={med.id} style={styles.infoRow}>
                    <Pill color={theme.warning} size={20} />
                    <Text style={[styles.infoText, { color: theme.text }]}>{med.name} - {med.dosage}</Text>
                  </View>
                ))}
              </PremiumCard>
            </View>
          ))
        )}

        <AnimatedButton title={t('pets.addProfile')} onPress={() => {}} style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileName: { fontSize: 24, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  infoText: { fontSize: 16, marginLeft: 12 }
});
