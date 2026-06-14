import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSubscriptionStatus, useCheckoutSession } from '../../features/subscription/subscription-api';
import * as WebBrowser from 'expo-web-browser';

export default function SubscriptionScreen() {
  const { data, isLoading, refetch } = useSubscriptionStatus();
  const checkoutMutation = useCheckoutSession();

  const handleSubscribe = async () => {
    try {
      const res = await checkoutMutation.mutateAsync();
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

  const { status, trialEndsAt, currentPeriodEnd } = data || { status: 'inactive', trialEndsAt: null, currentPeriodEnd: null };

  const renderTrial = () => {
    if (!trialEndsAt) return null;
    const daysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Free Trial</Text>
        <Text style={styles.text}>You have {daysLeft} days remaining in your free trial.</Text>
        <TouchableOpacity style={styles.button} onPress={handleSubscribe}>
          <Text style={styles.buttonText}>Subscribe Now ($4.99/mo)</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderActive = () => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Active Subscription</Text>
        <Text style={styles.text}>Your subscription is active!</Text>
        {currentPeriodEnd && (
          <Text style={styles.subtext}>Renews on: {new Date(currentPeriodEnd).toLocaleDateString()}</Text>
        )}
      </View>
    );
  };

  const renderPaywall = () => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Subscription Expired</Text>
        <Text style={styles.text}>Your access is currently read-only.</Text>
        <Text style={styles.subtext}>Subscribe for $4.99/mo to unlock creating and editing features.</Text>
        <TouchableOpacity style={styles.button} onPress={handleSubscribe}>
          <Text style={styles.buttonText}>Subscribe Now ($4.99/mo)</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {status === 'trialing' && renderTrial()}
      {status === 'active' && renderActive()}
      {['inactive', 'expired', 'canceled'].includes(status) && renderPaywall()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  text: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 8 },
  subtext: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#0a7ea4', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
