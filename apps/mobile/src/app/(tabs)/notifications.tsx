import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications, useMarkNotificationRead } from '../../features/notifications/notifications-api';
import { EmptyState } from '../../components/EmptyState';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { data: response, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const notifications = response?.data || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('nav.notifications')} />
      
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState message="No alerts at this time." />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.notificationCard, 
                { backgroundColor: item.isRead ? theme.backgroundElement : theme.primary + '15', borderColor: theme.border }
              ]}
              onPress={() => {
                if (!item.isRead) markRead.mutate(item.id);
              }}
            >
              <Text style={[styles.notificationTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={{ color: theme.textSecondary }}>{item.message}</Text>
              <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 12 }}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  notificationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  }
});
