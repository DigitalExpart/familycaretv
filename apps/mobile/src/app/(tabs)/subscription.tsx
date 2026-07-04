import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useSubscriptionStatus, useCheckoutSession } from '../../features/subscription/subscription-api';
import * as WebBrowser from 'expo-web-browser';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { Check, Star } from 'lucide-react-native';

export default function SubscriptionScreen() {
  const { data, isLoading, refetch } = useSubscriptionStatus();
  const checkoutMutation = useCheckoutSession();

  const handleSubscribe = async (plan: 'PERSONAL' | 'FAMILY') => {
    try {
      const res = await checkoutMutation.mutateAsync({ plan });
      if (res.url) {
        await WebBrowser.openBrowserAsync(res.url);
        refetch(); // Refetch status when browser is closed
      }
    } catch (e) {
      console.error('Checkout failed', e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  const { status, planTier, trialEndsAt, currentPeriodEnd } = data || { status: 'inactive', planTier: 'FREE_TRIAL', trialEndsAt: null, currentPeriodEnd: null };
  const isFamily = planTier === 'FAMILY';
  const isPersonal = planTier === 'PERSONAL';

  const renderActive = () => {
    return (
      <View style={styles.activeCard}>
        <View style={styles.activeHeader}>
          <Star color="#F59E0B" size={28} />
          <Text style={styles.activeTitle}>Active {isFamily ? 'Family' : 'Personal'} Plan</Text>
        </View>
        <Text style={styles.activeText}>Your subscription is active and unlocking premium features.</Text>
        {currentPeriodEnd && (
          <Text style={styles.activeSubtext}>Renews on: {new Date(currentPeriodEnd).toLocaleDateString()}</Text>
        )}
        {isPersonal && (
          <TouchableOpacity style={[styles.button, styles.upgradeBtn]} onPress={() => handleSubscribe('FAMILY')}>
            <Text style={styles.buttonText}>Upgrade to Family Plan ($9.99/mo)</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Choose Your Plan" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {status === 'active' && renderActive()}

        {status === 'trialing' && trialEndsAt && (
          <View style={styles.trialBanner}>
            <Text style={styles.trialTitle}>Free Trial Active</Text>
            <Text style={styles.trialText}>
              You have {Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining. Upgrade now to avoid interruption.
            </Text>
          </View>
        )}

        {['inactive', 'expired', 'canceled'].includes(status) && (
          <View style={styles.expiredBanner}>
            <Text style={styles.expiredTitle}>Subscription Expired</Text>
            <Text style={styles.expiredText}>Your access is currently read-only. Please select a plan to unlock features.</Text>
          </View>
        )}

        {/* PERSONAL PLAN CARD */}
        <View style={[styles.planCard, isPersonal ? styles.planCardActive : null]}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Personal Plan</Text>
            <Text style={styles.planPrice}>$4.99<Text style={styles.planPriceMonth}>/mo</Text></Text>
          </View>
          <View style={styles.planFeatures}>
            <FeatureRow text="2 patients & 3 kids" />
            <FeatureRow text="2 pets" />
            <FeatureRow text="3 medications & appointments" />
            <FeatureRow text="4 notes & 3 tasks" />
            <FeatureRow text="1 Roku device" />
            <FeatureRow text="3 AI lookups per day" />
          </View>
          <TouchableOpacity 
            style={[styles.button, isPersonal ? styles.buttonDisabled : null]} 
            onPress={() => handleSubscribe('PERSONAL')}
            disabled={isPersonal}
          >
            <Text style={styles.buttonText}>{isPersonal ? 'Current Plan' : 'Subscribe to Personal'}</Text>
          </TouchableOpacity>
        </View>

        {/* FAMILY PLAN CARD */}
        <View style={[styles.planCard, styles.familyCard, isFamily ? styles.planCardActive : null]}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>BEST VALUE</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Family Plan</Text>
            <Text style={styles.planPrice}>$9.99<Text style={styles.planPriceMonth}>/mo</Text></Text>
          </View>
          <View style={styles.planFeatures}>
            <FeatureRow text="Everything in Personal" />
            <FeatureRow text="Add up to 3 family members" />
            <FeatureRow text="3 Roku devices" />
            <FeatureRow text="Unlimited patients, kids & pets" />
            <FeatureRow text="Unlimited medications & appointments" />
            <FeatureRow text="Unlimited notes & tasks" />
            <FeatureRow text="Unlimited AI lookups" />
          </View>
          <TouchableOpacity 
            style={[styles.button, styles.familyButton, isFamily ? styles.buttonDisabled : null]} 
            onPress={() => handleSubscribe('FAMILY')}
            disabled={isFamily}
          >
            <Text style={styles.buttonText}>{isFamily ? 'Current Plan' : 'Subscribe to Family'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Check color="#0a7ea4" size={20} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9' },
  scrollContent: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  trialBanner: { backgroundColor: '#E0F2FE', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#BAE6FD' },
  trialTitle: { color: '#0369A1', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  trialText: { color: '#0284C7', fontSize: 14 },

  expiredBanner: { backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FECACA' },
  expiredTitle: { color: '#991B1B', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  expiredText: { color: '#B91C1C', fontSize: 14 },

  activeCard: { backgroundColor: '#FEF3C7', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A' },
  activeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  activeTitle: { fontSize: 20, fontWeight: '700', color: '#92400E', marginLeft: 8 },
  activeText: { fontSize: 15, color: '#B45309', marginBottom: 4 },
  activeSubtext: { fontSize: 14, color: '#D97706', fontWeight: '500' },
  upgradeBtn: { backgroundColor: '#F59E0B', marginTop: 16 },

  planCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 4, borderWidth: 2, borderColor: 'transparent' },
  planCardActive: { borderColor: '#0a7ea4' },
  familyCard: { borderColor: 'transparent', position: 'relative' },
  badgeContainer: { position: 'absolute', top: -12, right: 20, backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, zIndex: 1 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 16 },
  planName: { fontSize: 22, fontWeight: '700', color: '#111827' },
  planPrice: { fontSize: 24, fontWeight: '800', color: '#0a7ea4' },
  planPriceMonth: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  
  planFeatures: { marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { fontSize: 15, color: '#4B5563', marginLeft: 12 },
  
  button: { backgroundColor: '#0a7ea4', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  familyButton: { backgroundColor: '#0ea5e9' },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  spacer: { height: 40 }
});
