import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useRouter } from 'expo-router';
import { api } from '../../api/client';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { LogOut, Settings, Globe, Shield, CreditCard, User as UserIcon, Edit2, Users, Tv } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/me');
        if (data?.success) {
          updateUser(data.data);
          // Sync language with backend if different
          if ((data.data as any).language && (data.data as any).language !== i18n.language) {
            i18n.changeLanguage((data.data as any).language);
          }
        }
      } catch (e: any) {
        if (e.response?.status !== 401) {
          console.error('Failed to fetch latest profile', e);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(newLang);
    if (user) {
      api.put('/users/me', { language: newLang }).catch(console.error);
      updateUser({ language: newLang } as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader 
        title={t('nav.profile')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.profileHeader}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {user?.firstName} {user?.lastName}
            </Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>
                {user?.planTier === 'FAMILY' ? t('profile.familyPlanBadge', 'FAMILY PLAN') : (user?.planTier === 'PERSONAL' ? 'PERSONAL PLAN' : 'FREE PLAN')}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
            onPress={() => router.push('/(tabs)/edit-profile')}
          >
            <Edit2 size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings.title')}</Text>
        
        <PremiumCard noPadding>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(tabs)/connect-roku')}>
            <View style={styles.settingIconContainer}>
              <Tv color="#E50914" size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('profile.connectRoku', 'Connect Roku TV')}</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                {t('profile.connectRokuDesc', 'Pair and manage your Roku TV Companion')}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={toggleLanguage}>
            <View style={styles.settingIconContainer}>
              <Globe color={theme.primary} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings.language')}</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                {i18n.language.startsWith('es') ? 'Español' : 'English'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Settings color={theme.secondary} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings.theme')}</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                {isDark ? t('profile.darkMode', 'Dark Mode') : t('profile.lightMode', 'Light Mode')}
              </Text>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme}
              trackColor={{ false: '#E2E8F0', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(tabs)/subscription')}>
            <View style={styles.settingIconContainer}>
              <CreditCard color={theme.accent} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('profile.subscription')}</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                {user?.subscriptionStatus === 'active' ? t('profile.active', 'Active') : 'Free Plan'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.settingRow} 
            onPress={() => {
              if (user?.planTier !== 'FAMILY') {
                Alert.alert(
                  "Upgrade Required", 
                  "You need the Family Plan to add and manage family members. Would you like to view plans?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "View Plans", onPress: () => router.push('/(tabs)/subscription') }
                  ]
                );
              } else {
                router.push('/(tabs)/family');
              }
            }}
          >
            <View style={styles.settingIconContainer}>
              <Users color={theme.primary} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('profile.familyMembers', 'Family Members')}</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                {t('profile.familyMembersDesc', 'Manage your family plan members')}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(tabs)/referrals')}>
            <View style={styles.settingIconContainer}>
              <Settings color={theme.warning} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('profile.referrals', 'Referrals & Commission')}</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                {t('profile.referralsDesc', 'Share your code and view stats')}
              </Text>
            </View>
          </TouchableOpacity>

        </PremiumCard>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.account', 'Account')}</Text>

        <AnimatedButton 
          title={t('profile.logout')} 
          variant="danger" 
          onPress={handleLogout} 
          style={styles.logoutBtn}
        />
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
    marginLeft: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  planBadge: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  planBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 72,
  },
  logoutBtn: {
    marginTop: 20,
  },
});
