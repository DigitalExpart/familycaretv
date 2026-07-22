import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../api/client';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import {
  Tv,
  CheckCircle2,
  Tv2,
  Trash2,
  Info,
  ExternalLink,
} from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface ConnectedDevice {
  id: string;
  deviceId: string;
  deviceName: string | null;
  deviceModel: string | null;
  appVersion: string | null;
  linkedAt: string | null;
  lastSeen: string | null;
}

interface PlanLimitInfo {
  usedCount: number;
  maxLimit: number;
  planTier: string;
}

export default function ConnectRokuScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const scrollViewRef = useRef<ScrollView>(null);

  const [code, setCode] = useState('');
  const [deviceName, setDeviceName] = useState('Living Room TV');
  const [linking, setLinking] = useState(false);

  const [loadingDevices, setLoadingDevices] = useState(true);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [planLimit, setPlanLimit] = useState<PlanLimitInfo>({
    usedCount: 0,
    maxLimit: 1,
    planTier: 'PERSONAL',
  });

  const fetchDevices = async () => {
    try {
      setLoadingDevices(true);
      const { data } = await api.get('/roku/devices');
      if (data?.success) {
        setDevices(data.data.devices || []);
        setPlanLimit(data.data.planLimit);
      }
    } catch (err) {
      console.error('Failed to load connected Roku devices', err);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleLinkDevice = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      Alert.alert('Error', 'Please enter the 6-8 character code shown on your Roku TV.');
      return;
    }

    try {
      setLinking(true);
      const { data } = await api.post('/roku/link-device', {
        code: trimmedCode,
        deviceName: deviceName.trim() || 'Roku TV',
        deviceModel: 'Roku Device',
        appVersion: '1.0.0',
      });

      if (data?.success) {
        Alert.alert(
          'Connected! 🎉',
          'Your Roku TV has been successfully linked to your FamilyCare account. Your TV will automatically update!',
          [{ text: 'Great!', onPress: () => setCode('') }]
        );
        fetchDevices();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to link device. Please verify code and try again.';
      Alert.alert('Link Failed', msg);
    } finally {
      setLinking(false);
    }
  };

  const handleRemoveDevice = (device: ConnectedDevice) => {
    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove "${device.deviceName || 'Roku TV'}" from your account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/roku/devices/${device.id}`);
              fetchDevices();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to remove device.');
            }
          },
        },
      ]
    );
  };

  const formatLastSeen = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const features = [
    { title: 'Daily Reminders', desc: 'Unified task & medication alerts' },
    { title: 'Medication Alerts', desc: 'Real-time schedule updates' },
    { title: 'Verse of the Day', desc: 'Daily inspirational scriptures' },
    { title: 'Book of the Day', desc: 'Curated library highlights' },
    { title: 'Music & Audio', desc: 'Relaxing caregiving soundscapes' },
    { title: 'Kids & Pets Care', desc: 'Activity & care management' },
    { title: 'Family Dashboard', desc: 'Shared family overview' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Connect Roku TV" showBack />
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
        {/* Header Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.iconBadge, { backgroundColor: theme.primary + '18' }]}>
            <Tv size={36} color={theme.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Bring FamilyCare to your TV</Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            View reminders, medications, appointments, Bible verses, books, music, and family updates directly on your Roku TV.
          </Text>
        </View>

        {/* Section 1: What Roku Offers */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>✨ What Roku Offers</Text>
        <PremiumCard noPadding>
          <View style={styles.featuresContainer}>
            {features.map((feat, idx) => (
              <View key={idx} style={styles.featureItem}>
                <CheckCircle2 size={18} color={theme.primary} style={styles.checkIcon} />
                <View style={styles.featureTextWrap}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>{feat.title}</Text>
                  <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{feat.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </PremiumCard>

        {/* Section 2: Installation Guide */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>📲 How to Install</Text>
        <PremiumCard>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <Text style={[styles.stepText, { color: theme.text }]}>Turn on your Roku TV or device.</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <Text style={[styles.stepText, { color: theme.text }]}>Open the Roku Channel Store on your TV.</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepBadgeText}>3</Text>
            </View>
            <Text style={[styles.stepText, { color: theme.text }]}>Search for "FamilyCare TV" and select Install.</Text>
          </View>

          <TouchableOpacity
            style={[styles.webLinkBtn, { borderColor: theme.border }]}
            onPress={() => {
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 380, animated: true });
              }
            }}
          >
            <ExternalLink size={16} color={theme.primary} />
            <Text style={[styles.webLinkBtnText, { color: theme.primary }]}>Enter Pairing Code Below</Text>
          </TouchableOpacity>
        </PremiumCard>

        {/* Section 3: Link Device */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🔗 Link Device</Text>
        <PremiumCard>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Enter the 6-8 digit code displayed on your Roku TV screen:
          </Text>

          <Text style={[styles.inputLabel, { color: theme.text }]}>Pairing Code</Text>
          <TextInput
            style={[
              styles.codeInput,
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="e.g. ABC123XY"
            placeholderTextColor={theme.textSecondary}
            value={code}
            onChangeText={(txt) => setCode(txt.toUpperCase())}
            autoCapitalize="characters"
            maxLength={8}
          />

          <Text style={[styles.inputLabel, { color: theme.text }]}>Device Name (Optional)</Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="e.g. Living Room TV"
            placeholderTextColor={theme.textSecondary}
            value={deviceName}
            onChangeText={setDeviceName}
          />

          <AnimatedButton
            title={linking ? 'Linking Device...' : 'Link Device'}
            onPress={handleLinkDevice}
            loading={linking}
            disabled={linking || !code.trim()}
            style={styles.linkBtn}
          />
        </PremiumCard>

        {/* Section 4: Connected Devices & Plan Limits */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitleNoMargin, { color: theme.text }]}>🖥️ Connected Devices</Text>
          <View style={[styles.limitPill, { backgroundColor: planLimit.planTier === 'ADMIN' ? '#10B98120' : theme.primary + '20' }]}>
            <Text style={[styles.limitPillText, { color: planLimit.planTier === 'ADMIN' ? '#10B981' : theme.primary }]}>
              {planLimit.planTier === 'ADMIN' 
                ? 'Platform Administrator • Unlimited Access' 
                : `${planLimit.usedCount} / ${planLimit.maxLimit} Roku Devices`}
            </Text>
          </View>
        </View>

        <PremiumCard noPadding>
          {loadingDevices ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : devices.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Tv2 size={32} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Roku TV linked yet</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Install FamilyCare TV on your Roku and enter the pairing code above.
              </Text>
            </View>
          ) : (
            devices.map((device, idx) => (
              <View key={device.id}>
                {idx > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                <View style={styles.deviceRow}>
                  <View style={[styles.deviceIconBg, { backgroundColor: theme.primary + '15' }]}>
                    <Tv size={22} color={theme.primary} />
                  </View>

                  <View style={styles.deviceInfo}>
                    <Text style={[styles.deviceNameText, { color: theme.text }]}>
                      {device.deviceName || 'Roku TV'}
                    </Text>
                    <Text style={[styles.deviceSubText, { color: theme.textSecondary }]}>
                      Last seen: {formatLastSeen(device.lastSeen)}
                    </Text>
                    {device.deviceModel && (
                      <Text style={[styles.deviceModelText, { color: theme.textSecondary }]}>
                        Model: {device.deviceModel}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveDevice(device)}
                  >
                    <Trash2 size={18} color={theme.danger || '#EF4444'} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </PremiumCard>

        {/* Section 5: Expectations Note */}
        <View style={[styles.noteCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
          <Info size={20} color={theme.primary} style={styles.noteIcon} />
          <View style={styles.noteTextWrap}>
            <Text style={[styles.noteTitle, { color: theme.primary }]}>Roku Notification Expectations</Text>
            <Text style={[styles.noteDesc, { color: theme.textSecondary }]}>
              When FamilyCare TV is open on your Roku TV, you'll receive medication reminders, task alerts, Bible verses, and family updates live on screen.
              {'\n\n'}
              Due to Roku platform policy constraints, notification popups cannot display over external channels like Netflix or YouTube when FamilyCare TV is closed.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitleNoMargin: {
    fontSize: 16,
    fontWeight: '700',
  },
  limitPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  limitPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  featuresContainer: {
    padding: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  checkIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  stepText: {
    fontSize: 14,
    flex: 1,
  },
  webLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  webLinkBtnText: {
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  codeInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 14,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  linkBtn: {
    marginTop: 4,
  },
  centerLoading: {
    padding: 24,
    alignItems: 'center',
  },
  emptyWrap: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  deviceIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceNameText: {
    fontSize: 15,
    fontWeight: '700',
  },
  deviceSubText: {
    fontSize: 12,
    marginTop: 2,
  },
  deviceModelText: {
    fontSize: 11,
    marginTop: 1,
  },
  removeBtn: {
    padding: 8,
  },
  divider: {
    height: 1,
  },
  noteCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 24,
  },
  noteIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  noteTextWrap: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  noteDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
});
