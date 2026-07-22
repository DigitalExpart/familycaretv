import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Pressable, Image } from 'react-native';
import { useSubscriptionStatus, useCheckoutSession, usePaypalCheckoutSession } from '../../features/subscription/subscription-api';
import * as WebBrowser from 'expo-web-browser';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { Check, Star, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/theme';

export default function SubscriptionScreen() {
  const { data, isLoading, refetch } = useSubscriptionStatus();
  const checkoutMutation = useCheckoutSession();
  const paypalMutation = usePaypalCheckoutSession();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'PERSONAL' | 'FAMILY' | null>(null);

  const handleSubscribe = (plan: 'PERSONAL' | 'FAMILY') => {
    setSelectedPlan(plan);
    setPaymentModalVisible(true);
  };

  const handlePaymentMethodSelected = async (method: 'STRIPE' | 'PAYPAL') => {
    if (!selectedPlan) return;
    setPaymentModalVisible(false);
    
    try {
      const res = method === 'STRIPE' 
        ? await checkoutMutation.mutateAsync({ plan: selectedPlan })
        : await paypalMutation.mutateAsync({ plan: selectedPlan });
        
      if (res.url) {
        await WebBrowser.openBrowserAsync(res.url);
        refetch(); // Refetch status when browser is closed
      }
    } catch (e: any) {
      console.error('Checkout failed:', e.response?.data || e.message);
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
  const isAdmin = planTier === 'ADMIN';
  const isFamily = planTier === 'FAMILY';
  const isPersonal = planTier === 'PERSONAL';

  if (isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <GradientHeader title={t('subscription.title')} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.activeCard, { borderColor: '#10B981', backgroundColor: isDark ? '#064E3B40' : '#ECFDF5' }]}>
            <View style={styles.activeHeader}>
              <ShieldCheck color="#10B981" size={32} />
              <Text style={[styles.activeTitle, { color: '#065F46', fontSize: 20 }]}>Platform Administrator</Text>
            </View>
            <Text style={[styles.activeText, { color: '#047857', fontSize: 14, lineHeight: 22, marginTop: 8 }]}>
              You are logged in as a Platform Administrator. Your account has permanent, unlimited access to all FamilyCare TV features, companion Roku devices, AI lookups, patients, kids, pets, tasks, notes, and CMS management tools.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const renderActive = () => {
    return (
      <View style={[styles.activeCard, isDark && { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
        <View style={styles.activeHeader}>
          <Star color="#F59E0B" size={28} />
          <Text style={[styles.activeTitle, isDark && { color: theme.text }]}>{t('subscription.activeTitle')}</Text>
        </View>
        <Text style={[styles.activeText, isDark && { color: theme.textSecondary }]}>{t('subscription.activeText')}</Text>
        {currentPeriodEnd && (
          <Text style={[styles.activeSubtext, isDark && { color: theme.primary }]}>{t('subscription.renewsOn')}{new Date(currentPeriodEnd).toLocaleDateString()}</Text>
        )}
        {isPersonal && (
          <TouchableOpacity style={[styles.button, styles.upgradeBtn]} onPress={() => handleSubscribe('FAMILY')}>
            <Text style={styles.buttonText}>{t('subscription.upgradeToFamily')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('subscription.title')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {status === 'active' && renderActive()}

        {status === 'trialing' && trialEndsAt && (
          <View style={[styles.trialBanner, isDark && { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Text style={[styles.trialTitle, isDark && { color: theme.text }]}>{t('subscription.freeTrial')}</Text>
            <Text style={[styles.trialText, isDark && { color: theme.textSecondary }]}>
              {t('subscription.trialRemaining', { days: Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) })}
            </Text>
          </View>
        )}

        {['inactive', 'expired', 'canceled'].includes(status) && (
          <View style={[styles.expiredBanner, isDark && { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Text style={[styles.expiredTitle, isDark && { color: theme.text }]}>{t('subscription.expired')}</Text>
            <Text style={[styles.expiredText, isDark && { color: theme.textSecondary }]}>{t('subscription.expiredDesc')}</Text>
          </View>
        )}

        {/* PERSONAL PLAN CARD */}
        <View style={[styles.planCard, { backgroundColor: theme.backgroundElement }, isPersonal ? { borderColor: theme.primary } : null]}>
          <View style={[styles.planHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.planName, { color: theme.text }]}>{t('subscription.personal')}</Text>
            <Text style={styles.planPrice}>$4.99<Text style={[styles.planPriceMonth, { color: theme.textSecondary }]}>/mo</Text></Text>
          </View>
          <View style={styles.planFeatures}>
            <FeatureRow text={t('subscription.features.personal1')} theme={theme} />
            <FeatureRow text={t('subscription.features.personal2')} theme={theme} />
            <FeatureRow text={t('subscription.features.personal3')} theme={theme} />
            <FeatureRow text={t('subscription.features.personal4')} theme={theme} />
            <FeatureRow text={t('subscription.features.personal5')} theme={theme} />
            <FeatureRow text={t('subscription.features.personal6')} theme={theme} />
          </View>
          <TouchableOpacity 
            style={[styles.button, isPersonal ? styles.buttonDisabled : null]} 
            onPress={() => handleSubscribe('PERSONAL')}
            disabled={isPersonal}
          >
            <Text style={styles.buttonText}>{isPersonal ? t('subscription.currentPlan') : t('subscription.subscribePersonal')}</Text>
          </TouchableOpacity>
        </View>

        {/* FAMILY PLAN CARD */}
        <View style={[styles.planCard, styles.familyCard, { backgroundColor: theme.backgroundElement }, isFamily ? { borderColor: theme.primary } : null]}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{t('subscription.bestValue')}</Text>
          </View>
          <View style={[styles.planHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.planName, { color: theme.text }]}>{t('subscription.family')}</Text>
            <Text style={styles.planPrice}>$9.99<Text style={[styles.planPriceMonth, { color: theme.textSecondary }]}>/mo</Text></Text>
          </View>
          <View style={styles.planFeatures}>
            <FeatureRow text={t('subscription.features.family1')} theme={theme} />
            <FeatureRow text={t('subscription.features.family2')} theme={theme} />
            <FeatureRow text={t('subscription.features.family3')} theme={theme} />
            <FeatureRow text={t('subscription.features.family4')} theme={theme} />
            <FeatureRow text={t('subscription.features.family5')} theme={theme} />
            <FeatureRow text={t('subscription.features.family6')} theme={theme} />
            <FeatureRow text={t('subscription.features.family7')} theme={theme} />
          </View>
          <TouchableOpacity 
            style={[styles.button, styles.familyButton, isFamily ? styles.buttonDisabled : null]} 
            onPress={() => handleSubscribe('FAMILY')}
            disabled={isFamily}
          >
            <Text style={styles.buttonText}>{isFamily ? t('subscription.currentPlan') : t('subscription.subscribeFamily')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPaymentModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Payment Method</Text>
            
            <TouchableOpacity 
              style={[styles.paymentButton, { borderColor: theme.border }]} 
              onPress={() => handlePaymentMethodSelected('STRIPE')}
            >
              <Image 
                source={require('../../../assets/images/stripe-logo.png')} 
                style={styles.paymentLogoStripe} 
                resizeMode="contain" 
              />
              <View style={styles.paymentButtonTextContainer}>
                <Text style={[styles.paymentButtonTitle, { color: theme.text }]}>Pay with Stripe</Text>
                <Text style={[styles.paymentButtonSub, { color: theme.textSecondary }]}>Credit Cards, Apple Pay, Google Pay</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentButton, { borderColor: theme.border }]} 
              onPress={() => handlePaymentMethodSelected('PAYPAL')}
            >
              <Image 
                source={require('../../../assets/images/paypal-logo.png')} 
                style={styles.paymentLogoPaypal} 
                resizeMode="contain" 
              />
              <View style={styles.paymentButtonTextContainer}>
                <Text style={[styles.paymentButtonTitle, { color: theme.text }]}>PayPal</Text>
                <Text style={[styles.paymentButtonSub, { color: theme.textSecondary }]}>Pay with your PayPal account</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setPaymentModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

function FeatureRow({ text, theme }: { text: string, theme: any }) {
  return (
    <View style={styles.featureRow}>
      <Check color={theme.primary} size={20} />
      <Text style={[styles.featureText, { color: theme.textSecondary }]}>{text}</Text>
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
  
  spacer: { height: 40 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 24, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  paymentButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 16, borderRadius: 12, marginBottom: 12 },
  paymentLogoStripe: { width: 40, height: 24, marginRight: 16 },
  paymentLogoPaypal: { width: 32, height: 32, marginRight: 20, marginLeft: 4 },
  paymentButtonTextContainer: { flex: 1 },
  paymentButtonTitle: { fontSize: 18, fontWeight: '600', marginBottom: 2 },
  paymentButtonSub: { fontSize: 13 },
  cancelButton: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, color: '#6B7280', fontWeight: '600' }
});
