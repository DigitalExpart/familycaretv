import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Share, Platform } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/theme';
import { Copy, Share2, Users, CheckCircle, Gift } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';

export default function ReferralsScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { t } = useTranslation();

  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/users/me/referrals`, { headers });
      
      if (response.ok) {
        const { data } = await response.json();
        setReferralCode(data?.referralCode || '');
        setStats(data?.stats || null);
        setReferrals(data?.history || []);
      }
    } catch (e) {
      console.error('Failed to load referrals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReferralData();
  }, [token]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    alert('Referral code copied!');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${t('referrals.shareMessage')} ${referralCode}`,
        url: 'https://familycare.tv/register', // Optional
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { padding: 20 },
    subtitle: { fontSize: 16, color: theme.textSecondary, marginBottom: 24, lineHeight: 24 },
    codeCard: { 
      backgroundColor: theme.primary, 
      borderRadius: 24, 
      padding: 24, 
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    codeTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600', marginBottom: 12 },
    codeText: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: 1, marginBottom: 20, textAlign: 'center' },
    actionRow: { flexDirection: 'row', gap: 12 },
    actionBtn: { 
      backgroundColor: 'rgba(255,255,255,0.2)', 
      paddingVertical: 12, 
      paddingHorizontal: 20, 
      borderRadius: 16, 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 8 
    },
    actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    statBox: { 
      flex: 1, 
      backgroundColor: theme.backgroundElement, 
      borderRadius: 20, 
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center'
    },
    statValue: { fontSize: 28, fontWeight: '800', color: theme.text, marginVertical: 8 },
    statLabel: { fontSize: 14, color: theme.textSecondary, fontWeight: '600' },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 16 },
    listEmpty: { textAlign: 'center', color: theme.textSecondary, padding: 20 },
    referralCard: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    refName: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 4 },
    refDate: { fontSize: 13, color: theme.textSecondary },
    refStatus: { 
      paddingHorizontal: 12, 
      paddingVertical: 6, 
      borderRadius: 12, 
      overflow: 'hidden', 
      fontWeight: '600', 
      fontSize: 12 
    }
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBSCRIBED': return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'REGISTERED': return { bg: '#FEF3C7', text: '#B45309' };
      case 'PAID': return { bg: '#D1FAE5', text: '#047857' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const registeredCount = stats?.registered || 0;
  const subscribedCount = stats?.subscribed || 0;

  return (
    <View style={styles.container}>
      <GradientHeader title={t('referrals.title')} showBack={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>{t('referrals.subtitle')}</Text>

      <View style={styles.codeCard}>
        <Text style={styles.codeTitle}>{t('referrals.yourCode')}</Text>
        <Text style={styles.codeText}>{referralCode || '...'}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
            <Copy size={20} color="#FFF" />
            <Text style={styles.actionBtnText}>{t('referrals.copy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Share2 size={20} color="#FFF" />
            <Text style={styles.actionBtnText}>{t('referrals.share')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Users size={24} color={theme.primary} />
          <Text style={styles.statValue}>{registeredCount}</Text>
          <Text style={styles.statLabel}>{t('referrals.registered')}</Text>
        </View>
        <View style={styles.statBox}>
          <CheckCircle size={24} color={theme.accent} />
          <Text style={styles.statValue}>{subscribedCount}</Text>
          <Text style={styles.statLabel}>{t('referrals.subscribed')}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('referrals.history')}</Text>
      
      {referrals.length === 0 ? (
        <Text style={styles.listEmpty}>{t('referrals.noHistory')}</Text>
      ) : (
        referrals.map(r => {
          const st = getStatusColor(r.status);
          return (
            <View key={r.id} style={styles.referralCard}>
              <View>
                <Text style={styles.refName}>{r.name}</Text>
                <Text style={styles.refDate}>{new Date(r.date).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.refStatus, { backgroundColor: st.bg, color: st.text }]}>
                {r.status}
              </Text>
            </View>
          );
        })
      )}
      </ScrollView>
    </View>
  );
}
