import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, Image, Linking } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { useTranslation } from 'react-i18next';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { BookOpen, ExternalLink, QrCode } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import * as WebBrowser from 'expo-web-browser';

export default function BooksScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { data: booksData, isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const response = await api.get('/books');
      return response.data;
    }
  });

  const books = Array.isArray(booksData) ? booksData : (booksData?.data || []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const handleOpenStore = async (url?: string) => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      console.log('Failed to open browser, trying Linking...', e);
      Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('books.title') || 'Books'} />
      <ScrollView contentContainerStyle={styles.content}>
        
        {books.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
            {t('books.noBooks') || 'No books available right now.'}
          </Text>
        ) : null}

        {books.map((book: any) => (
          <PremiumCard key={book.id} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {book.imageUrl ? (
                <Image source={{ uri: book.imageUrl }} style={styles.bookCover} />
              ) : (
                <View style={[styles.bookCover, { backgroundColor: theme.surfaceSecondary, justifyContent: 'center', alignItems: 'center' }]}>
                  <BookOpen color={theme.textSecondary} size={32} />
                </View>
              )}
              
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[styles.bookTitle, { color: theme.text }]}>{book.title}</Text>
                {book.subtitle ? (
                  <Text style={[styles.bookSubtitle, { color: theme.textSecondary }]}>{book.subtitle}</Text>
                ) : null}
                <Text style={[styles.bookAuthor, { color: theme.primary }]}>{book.author}</Text>
                
                {book.description ? (
                  <Text style={[styles.bookDescription, { color: theme.textSecondary }]} numberOfLines={3}>
                    {book.description}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.actionsContainer}>
              {book.storeUrl ? (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => handleOpenStore(book.storeUrl)}
                >
                  <ExternalLink color="#FFF" size={18} />
                  <Text style={styles.actionBtnText}>
                    {t('books.buyNow') || 'Buy Now'}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {book.qrCodeUrl ? (
                <View style={[styles.qrButton, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}>
                  <QrCode color={theme.text} size={18} />
                  <Text style={[styles.qrButtonText, { color: theme.text }]}>
                    {t('books.scanQR')}
                  </Text>
                </View>
              ) : null}
            </View>

            {book.qrCodeUrl ? (
              <View style={styles.qrCodeContainer}>
                <Image source={{ uri: book.qrCodeUrl }} style={styles.qrCodeImage} />
              </View>
            ) : null}
          </PremiumCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  bookCover: { width: 80, height: 120, borderRadius: Radii.card, resizeMode: 'cover' },
  bookTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  bookSubtitle: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  bookAuthor: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  bookDescription: { fontSize: 13, lineHeight: 18 },
  actionsContainer: { flexDirection: 'row', marginTop: 16, gap: 12, alignItems: 'center' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: Radii.button },
  actionBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  qrButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: Radii.button, borderWidth: 1, flex: 1 },
  qrButtonText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  qrCodeContainer: { marginTop: 16, alignItems: 'center' },
  qrCodeImage: { width: 150, height: 150, borderRadius: 8 }
});
