import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('nav.notifications')} />
      <View style={styles.content}>
        <Text style={{ color: theme.textSecondary }}>Notifications content coming soon...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
