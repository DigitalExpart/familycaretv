import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Music, Play, Trash2 } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

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

  // Fallback to mock data if API doesn't return anything yet
  const mockSongs = [
    { id: '1', title: 'Acercame a tu Altar' },
    { id: '2', title: 'A la Meta Final' },
    { id: '3', title: 'Fui a la Iglesia Invitada' },
    { id: '4', title: 'Dios Sigue Haciendo Milagros' },
    { id: '5', title: 'El Leon de Juda me Cubrio' },
    { id: '6', title: 'Serpiente Vencida' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('music.title') || 'Music'} />
      <ScrollView contentContainerStyle={styles.content}>
        
        <PremiumCard style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Music color={theme.primary} size={24} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>Music by Eyben Colon</Text>
          </View>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 24, fontStyle: 'italic' }}>
            Songs written and composed by Eyben Colon, inspired by faith, healing and love.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Songs in Spanish</Text>
          
          <View style={{ marginTop: 12 }}>
            {mockSongs.map((song) => (
              <PremiumCard key={song.id} style={{ marginBottom: 12, backgroundColor: theme.surfaceSecondary }}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                  value={song.title}
                  editable={false}
                />
                <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface }]}>
                    <Play color={theme.error} size={16} />
                    <Text style={{ color: theme.error, fontSize: 12, fontWeight: '600', marginLeft: 6 }}>Listen on YouTube</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface }]}>
                    <Trash2 color={theme.error} size={16} />
                    <Text style={{ color: theme.error, fontSize: 12, fontWeight: '600', marginLeft: 6 }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </PremiumCard>
            ))}
          </View>
        </PremiumCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  input: { padding: 12, borderRadius: Radii.input, height: 48, fontWeight: '500' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radii.card }
});
