import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { getPushDiagnostics, PushDiagnostics } from '../hooks/usePushNotifications';
import { useTheme } from '../hooks/useTheme';
import { Colors, Fonts, Spacing, Radii } from '../constants/theme';
import { api } from '../api/client';
import { useAuthStore } from '../store/auth.store';

export default function PushDiagnosticsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { user } = useAuthStore();

  const [diag, setDiag] = useState<PushDiagnostics | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDiag = () => {
    const d = getPushDiagnostics();
    setDiag(d);
  };

  useEffect(() => {
    loadDiag();
    const interval = setInterval(loadDiag, 2000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDiag();
    setRefreshing(false);
  };

  const triggerTestPush = async () => {
    if (!user?.id) {
      setTestResult('ERROR: No user ID available');
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await api.post('/notifications/test-device', { userId: user.id });
      setTestResult(JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      const errData = e?.response?.data ? JSON.stringify(e.response.data, null, 2) : e?.message || String(e);
      setTestResult(`ERROR: ${errData}`);
    } finally {
      setTestLoading(false);
    }
  };

  const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <View style={[styles.badge, { backgroundColor: ok ? theme.success + '22' : theme.danger + '22' }]}>
      <Text style={[styles.badgeIcon]}>{ok ? '✅' : '❌'}</Text>
      <Text style={[styles.badgeText, { color: ok ? theme.success : theme.danger }]}>{label}</Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>🔔 Push Diagnostics</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Pipeline Trace Dashboard</Text>
      </View>

      {/* Status Cards */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Pipeline Status</Text>
        <View style={styles.badgeRow}>
          <StatusBadge ok={diag?.permissionStatus === 'granted'} label={`Permission: ${diag?.permissionStatus || 'unknown'}`} />
          <StatusBadge ok={!!diag?.expoPushToken} label={diag?.expoPushToken ? 'Token Generated' : 'No Token'} />
          <StatusBadge ok={!!diag?.tokenUploaded} label={diag?.tokenUploaded ? 'Uploaded to Backend' : 'Not Uploaded'} />
        </View>
      </View>

      {/* Token Display */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Expo Push Token</Text>
        <Text
          style={[styles.tokenText, { color: theme.primary, backgroundColor: theme.backgroundSelected }]}
          selectable
        >
          {diag?.expoPushToken || 'Not yet generated'}
        </Text>
      </View>

      {/* Sync Info */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Backend Sync</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Last Sync:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{diag?.lastSyncTime || 'Never'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Response:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={3}>
            {diag?.lastUploadResponse || 'No response yet'}
          </Text>
        </View>
      </View>

      {/* Test Push Button */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Test Direct Push</Text>
        <Text style={[styles.infoLabel, { color: theme.textSecondary, marginBottom: 12 }]}>
          Sends a push notification directly from the backend, bypassing reminders and schedulers.
        </Text>
        <TouchableOpacity
          style={[styles.testBtn, { backgroundColor: theme.primary, opacity: testLoading ? 0.6 : 1 }]}
          onPress={triggerTestPush}
          disabled={testLoading}
        >
          <Text style={styles.testBtnText}>{testLoading ? 'Sending...' : '🚀 Send Test Push'}</Text>
        </TouchableOpacity>
        {testResult && (
          <ScrollView horizontal style={{ marginTop: 12 }}>
            <Text
              style={[styles.logText, { color: theme.text, backgroundColor: theme.backgroundSelected }]}
              selectable
            >
              {testResult}
            </Text>
          </ScrollView>
        )}
      </View>

      {/* Diagnostic Logs */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginBottom: 60 }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Diagnostic Logs</Text>
        <TouchableOpacity onPress={loadDiag} style={{ marginBottom: 8 }}>
          <Text style={[styles.refreshLink, { color: theme.primary }]}>↻ Refresh Logs</Text>
        </TouchableOpacity>
        <ScrollView style={{ maxHeight: 400 }}>
          {diag?.logs && diag.logs.length > 0 ? (
            diag.logs.map((log, i) => (
              <Text
                key={i}
                style={[
                  styles.logEntry,
                  {
                    color: log.includes('ERROR') || log.includes('❌')
                      ? theme.danger
                      : log.includes('✅')
                      ? theme.success
                      : log.includes('⚠️')
                      ? theme.warning
                      : theme.textSecondary,
                  },
                ]}
              >
                {log}
              </Text>
            ))
          ) : (
            <Text style={{ color: theme.textSecondary }}>No logs yet. Wait for push registration to run.</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.md },
  header: { marginTop: 50, marginBottom: Spacing.lg },
  backBtn: { marginBottom: Spacing.sm },
  backText: { fontSize: 16, fontFamily: Fonts?.medium },
  title: { fontSize: 26, fontFamily: Fonts?.bold, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: Fonts?.sans },
  card: {
    borderRadius: Radii.card,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: 16, fontFamily: Fonts?.semiBold, marginBottom: Spacing.sm },
  badgeRow: { flexDirection: 'column', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    gap: 8,
  },
  badgeIcon: { fontSize: 16 },
  badgeText: { fontSize: 13, fontFamily: Fonts?.medium },
  tokenText: {
    fontSize: 12,
    fontFamily: Fonts?.mono,
    padding: 12,
    borderRadius: Radii.sm,
    overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', marginBottom: 6, gap: 8 },
  infoLabel: { fontSize: 13, fontFamily: Fonts?.medium, width: 90 },
  infoValue: { fontSize: 13, fontFamily: Fonts?.sans, flex: 1 },
  testBtn: {
    paddingVertical: 14,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
  testBtnText: { color: '#FFF', fontSize: 16, fontFamily: Fonts?.semiBold },
  logText: {
    fontSize: 11,
    fontFamily: Fonts?.mono,
    padding: 12,
    borderRadius: Radii.sm,
    minWidth: 600,
  },
  logEntry: {
    fontSize: 11,
    fontFamily: Fonts?.mono,
    paddingVertical: 2,
    lineHeight: 16,
  },
  refreshLink: { fontSize: 14, fontFamily: Fonts?.medium },
});
