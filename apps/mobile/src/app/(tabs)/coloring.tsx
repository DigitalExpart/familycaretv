import React from 'react';
import { View, StyleSheet, ScrollView, Text, Image, ActivityIndicator, Dimensions } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Palette } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

const { width } = Dimensions.get('window');

export default function ColoringScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { data: coloringData, isLoading } = useQuery({
    queryKey: ['coloring-pages'],
    queryFn: async () => {
      const response = await api.get('/coloring-pages');
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

  const pages = coloringData?.data || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('coloring.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        {pages.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Palette color={theme.textSecondary} size={48} />
            <Text style={{ color: theme.textSecondary, marginTop: 16 }}>{t('coloring.noPages')}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {pages.map((page: any) => (
              <View key={page.id} style={[styles.card, { backgroundColor: theme.surfaceSecondary }]}>
                <Image source={{ uri: page.imageUrl }} style={styles.image} resizeMode="contain" />
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{page.title}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: (width - 60) / 2, 
    borderRadius: Radii.card, 
    marginBottom: 16, 
    padding: 12, 
    alignItems: 'center' 
  },
  image: { width: '100%', aspectRatio: 1, marginBottom: 8, borderRadius: Radii.base },
  title: { fontSize: 14, fontWeight: '600', textAlign: 'center' }
});
