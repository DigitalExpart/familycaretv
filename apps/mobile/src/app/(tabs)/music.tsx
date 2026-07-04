import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Music, Play } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import * as WebBrowser from 'expo-web-browser';

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

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const handlePlay = async (url?: string) => {
    if (url) {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('music.title') || 'Music'} />
      <ScrollView contentContainerStyle={styles.content}>
        
        {categories.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
            {t('music.noSongs') || 'No music available right now.'}
          </Text>
        ) : null}

        {categories.map((category: any) => (
          <PremiumCard key={category.id} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Music color={theme.primary} size={24} />
              <Text style={[styles.headerTitle, { color: theme.text }]}>{category.name}</Text>
            </View>

            <View style={{ marginTop: 12 }}>
              {category.tracks?.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontStyle: 'italic', fontSize: 12 }}>
                  {t('music.noSongsInCategory') || 'No songs available in this category.'}
                </Text>
              ) : null}
              {category.tracks?.map((song: any) => (
                <PremiumCard key={song.id} style={{ marginBottom: 12, backgroundColor: theme.surfaceSecondary }}>
                  <Text style={[styles.songTitle, { color: theme.text }]}>
                    {song.title}
                  </Text>
                  {song.description ? (
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4, paddingHorizontal: 4 }}>
                      {song.description}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
                    {song.youtubeUrl ? (
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                        onPress={() => handlePlay(song.youtubeUrl)}
                      >
                        <Play color={theme.error} size={16} />
                        <Text style={{ color: theme.error, fontSize: 12, fontWeight: '600', marginLeft: 6 }}>
                          {t('music.listenYoutube') || 'Listen on YouTube'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                    
                    {song.audioUrl ? (
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                        onPress={() => handlePlay(song.audioUrl)}
                      >
                        <Play color={theme.primary} size={16} />
                        <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '600', marginLeft: 6 }}>
                          {t('music.listenAudio') || 'Play Audio'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </PremiumCard>
              ))}
            </View>
          </PremiumCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  songTitle: { fontSize: 16, fontWeight: '600', paddingHorizontal: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radii.card }
});
