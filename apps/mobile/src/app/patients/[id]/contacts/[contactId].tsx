import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContact, useDeleteContact } from '../../../../features/emergency-contacts/contacts-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { AnimatedButton } from '../../../../components/ui/AnimatedButton';
import { Edit2, Trash2, Phone, Mail } from 'lucide-react-native';

export default function ContactDetailsScreen() {
  const { id: patientId, contactId } = useLocalSearchParams<{ id: string; contactId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  
  const { data: contact, isLoading, error } = useContact(contactId as string);
  const deleteMutation = useDeleteContact();

  if (isLoading) return <LoadingSpinner />;
  if (error || !contact) return <EmptyState message={t('contacts.listEmpty', 'Contact not found.')} />;

  const handleDelete = () => {
    Alert.alert(
      t('contacts.actions.confirmDelete', 'Remove Contact'),
      t('contacts.actions.confirmDeleteDesc', 'Are you sure you want to remove this contact?'),
      [
        { text: t('common.cancel', 'Cancel'), style: "cancel" },
        { 
          text: t('common.delete', 'Remove'), 
          style: "destructive", 
          onPress: () => {
            deleteMutation.mutate({ id: contact.id, patientId: patientId as string }, {
              onSuccess: () => {
                router.back();
              }
            });
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
        <Text style={[styles.name, { color: theme.text }]}>{contact.name}</Text>
        <Text style={styles.relationship}>{contact.relationship}</Text>
      </View>
      
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Phone size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.label, { color: theme.textSecondary, marginBottom: 0 }]}>{t('contacts.form.phone', 'Phone')}</Text>
        </View>
        <Text style={[styles.value, { color: theme.text }]}>{contact.phone}</Text>
      </View>

      <View style={styles.actions}>
        <AnimatedButton 
          title={t('contacts.edit', 'Edit Contact')} 
          variant="primary" 
          onPress={() => router.push(`/patients/${patientId}/contacts/edit/${contact.id}`)} 
          style={{ marginBottom: 12 }}
        />
        <AnimatedButton 
          title={t('contacts.actions.delete', 'Remove Contact')} 
          variant="danger" 
          onPress={handleDelete} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  relationship: {
    fontSize: 16,
    color: '#e65c00',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    padding: 20,
    marginTop: 20,
  },
});
