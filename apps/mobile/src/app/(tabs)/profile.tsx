import React from 'react';
import { View, StyleSheet, ScrollView, Text, Switch } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useRouter } from 'expo-router';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { LogOut, Settings, Globe, Shield, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader 
        title={t('nav.profile')}
        subtitle={user?.email}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings.title')}</Text>
        
        <PremiumCard noPadding>
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Globe color={theme.primary} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings.language')}</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>English</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Settings color={theme.secondary} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings.theme')}</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
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
          
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <CreditCard color={theme.accent} size={24} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('profile.subscription')}</Text>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                {user?.subscriptionStatus === 'active' ? 'Active' : 'Free / Trial'}
              </Text>
            </View>
          </View>
        </PremiumCard>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>

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
