import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Music, PlayCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

export default function MusicScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['music-categories'],
    queryFn: async () => {
      const response = await api.get('/music/categories');
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

  const categories = categoriesData?.data || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('music.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        {categories.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Music color={theme.textSecondary} size={48} />
            <Text style={{ color: theme.textSecondary, marginTop: 16 }}>No music available yet.</Text>
          </View>
        ) : (
          categories.map((category: any) => (
            <View key={category.id} style={{ marginBottom: 24 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{category.name}</Text>
              {(category.tracks || []).map((track: any) => (
                <TouchableOpacity key={track.id} style={[styles.trackCard, { backgroundColor: theme.surfaceSecondary }]}>
                  <PlayCircle color={theme.primary} size={32} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.trackTitle, { color: theme.text }]}>{track.title}</Text>
                    {track.description && <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{track.description}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  trackCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: Radii.card, marginBottom: 8 },
  trackTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 }
});
