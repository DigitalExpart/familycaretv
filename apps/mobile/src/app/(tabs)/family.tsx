import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { useMyFamily, useInviteFamilyMember, useRemoveFamilyMember } from '../../features/family/family-api';
import { Mail, Trash2, Users, UserPlus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/theme';

export default function FamilyScreen() {
  const { data, isLoading } = useMyFamily();
  const inviteMutation = useInviteFamilyMember();
  const removeMutation = useRemoveFamilyMember();
  const [email, setEmail] = useState('');
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    try {
      await inviteMutation.mutateAsync(email);
      setEmail('');
      Alert.alert('Success', 'Invitation sent successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert(
      t('family.remove.title'),
      t('family.remove.message'),
      [
        { text: t('common.cancel'), style: "cancel" },
        { 
          text: t('family.remove.confirm'), 
          style: "destructive",
          onPress: async () => {
            try {
              await removeMutation.mutateAsync(id);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to remove member');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  const { isOwner, isMember, members, familyOwner } = data || { isOwner: false, isMember: false, members: [] };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('family.title')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* If the user is a member of someone else's family */}
        {isMember && familyOwner && (
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.cardHeader}>
              <Users color="#0a7ea4" size={24} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>{t('family.yourPlan')}</Text>
            </View>
            <Text style={[styles.text, { color: theme.textSecondary }]}>{t('family.managedBy')}</Text>
            <Text style={styles.ownerText}>{familyOwner.firstName} {familyOwner.lastName} ({familyOwner.email})</Text>
            <Text style={[styles.subtext, { color: theme.textSecondary }]}>{t('family.ownerOnly')}</Text>
          </View>
        )}

        {/* If the user is the owner, or neither (allow inviting to become owner) */}
        {!isMember && (
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.cardHeader}>
              <UserPlus color="#0a7ea4" size={24} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>{t('family.inviteMember')}</Text>
            </View>
            <Text style={[styles.text, { color: theme.textSecondary }]}>{t('family.inviteDesc')}</Text>
            
            <View style={[styles.inputContainer, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
              <Mail color={theme.textSecondary} size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t('family.emailPlaceholder')}
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, inviteMutation.isPending && styles.buttonDisabled]} 
              onPress={handleInvite}
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('family.sendInvite')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Member List */}
        {!isMember && members.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={[styles.listTitle, { color: theme.text }]}>{t('family.currentMembers')} ({members.length}/3)</Text>
            
            {members.map((m) => (
              <View key={m.id} style={[styles.memberItem, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.memberInfo}>
                  {m.status === 'PENDING' ? (
                    <>
                      <Text style={[styles.memberEmail, { color: theme.textSecondary }]}>{m.email}</Text>
                      <Text style={styles.statusPending}>{t('family.status.pending')}</Text>
                    </>
                  ) : m.status === 'DECLINED' ? (
                    <>
                      <Text style={[styles.memberEmail, { color: theme.textSecondary }]}>{m.email}</Text>
                      <Text style={styles.statusDeclined}>{t('family.status.declined')}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.memberName, { color: theme.text }]}>{m.member?.firstName} {m.member?.lastName}</Text>
                      <Text style={[styles.memberEmail, { color: theme.textSecondary }]}>{m.member?.email}</Text>
                      <Text style={styles.statusActive}>{t('family.status.active')}</Text>
                    </>
                  )}
                </View>
                
                {isOwner && (
                  <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(m.id)}>
                    <Trash2 color="#EF4444" size={20} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginLeft: 8, color: '#111827' },
  text: { fontSize: 14, color: '#4B5563', marginBottom: 16 },
  ownerText: { fontSize: 16, fontWeight: '600', color: '#0a7ea4', marginBottom: 8 },
  subtext: { fontSize: 13, color: '#9CA3AF' },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, backgroundColor: '#F9FAFB' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#111827' },
  
  button: { backgroundColor: '#0a7ea4', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  listContainer: { marginTop: 8 },
  listTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  
  memberItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  memberEmail: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  
  statusPending: { fontSize: 12, fontWeight: '600', color: '#F59E0B' },
  statusDeclined: { fontSize: 12, fontWeight: '600', color: '#EF4444' },
  statusActive: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  
  removeBtn: { padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8, marginLeft: 12 }
});
