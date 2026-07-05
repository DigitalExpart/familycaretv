import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications, useMarkNotificationRead, useMarkNotificationUnread, useDeleteNotification } from '../../features/notifications/notifications-api';
import { useAcceptFamilyInvite, useDeclineFamilyInvite } from '../../features/family/family-api';
import { Alert } from 'react-native';
import { EmptyState } from '../../components/EmptyState';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { data: response, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markUnread = useMarkNotificationUnread();
  const deleteNotification = useDeleteNotification();
  const acceptInvite = useAcceptFamilyInvite();
  const declineInvite = useDeclineFamilyInvite();
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
          renderItem={({ item }) => {
            const isFamilyInvite = item.actionUrl?.startsWith('family-invite:');
            const inviteCode = isFamilyInvite ? item.actionUrl!.split(':')[1] : null;

            return (
              <TouchableOpacity 
                style={[
                  styles.notificationCard, 
                  { backgroundColor: item.isRead ? theme.backgroundElement : theme.primary + '15', borderColor: theme.border }
                ]}
                onPress={() => {
                  if (!item.isRead) markRead.mutate(item.id);
                }}
                activeOpacity={item.isRead ? 1 : 0.7}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.notificationTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={{ color: theme.textSecondary }}>{item.message}</Text>
                    <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 12 }}>
                      {new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </Text>

                    {isFamilyInvite && inviteCode && (
                      <View style={styles.inviteActions}>
                        <TouchableOpacity 
                          style={[styles.inviteBtn, { backgroundColor: theme.primary }]}
                          onPress={() => {
                            acceptInvite.mutate(inviteCode, {
                              onSuccess: () => {
                                deleteNotification.mutate(item.id);
                                Alert.alert("Success", "You have joined the Family Plan.");
                              },
                              onError: (error: any) => {
                                Alert.alert("Error", error.response?.data?.message || "Failed to accept invite.");
                              }
                            });
                          }}
                        >
                          <Text style={styles.inviteBtnText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.inviteBtn, { backgroundColor: theme.surfaceSecondary, borderWidth: 1, borderColor: theme.border }]}
                          onPress={() => {
                            declineInvite.mutate(inviteCode, {
                              onSuccess: () => {
                                deleteNotification.mutate(item.id);
                              }
                            });
                          }}
                        >
                          <Text style={[styles.inviteBtnText, { color: theme.text }]}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  
                  {!isFamilyInvite && (
                    <TouchableOpacity 
                      style={{ 
                        backgroundColor: item.isRead ? theme.surfaceSecondary : theme.primary, 
                        paddingHorizontal: 10, 
                        paddingVertical: 6, 
                        borderRadius: 12, 
                        marginTop: 2,
                        borderWidth: item.isRead ? 1 : 0,
                        borderColor: theme.border
                      }}
                      onPress={() => item.isRead ? markUnread.mutate(item.id) : markRead.mutate(item.id)}
                    >
                      <Text style={{ color: item.isRead ? theme.textSecondary : '#FFF', fontSize: 12, fontWeight: '600' }}>
                        {item.isRead ? 'Mark Unread' : 'Mark Read'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
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
  },
  inviteActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  inviteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  inviteBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  }
});
