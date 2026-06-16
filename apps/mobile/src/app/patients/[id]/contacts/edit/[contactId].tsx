import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GradientHeader } from '../../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../../hooks/useTheme';
import { Colors } from '../../../../../constants/theme';
import { Trash2 } from 'lucide-react-native';
import { useContact, useUpdateContact } from '../../../../../features/emergency-contacts/contacts-api';
import { ContactForm } from '../../../../../components/ContactForm';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../../components/EmptyState';

export default function EditContactScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { id: patientId, contactId } = useLocalSearchParams<{ id: string; contactId: string }>();
  const router = useRouter();
  
  const { data: contact, isLoading, error } = useContact(contactId as string);
  const updateMutation = useUpdateContact();

  if (isLoading) return <LoadingSpinner />;
  if (error || !contact) return <EmptyState message="Contact not found." />;

  const handleSubmit = (data: any) => {
    updateMutation.mutate(
      { id: contact.id, updates: data },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Edit Contact" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <ContactForm 
        initialData={contact}
        onSubmit={handleSubmit} 
        isLoading={updateMutation.isPending} 
      />
          </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
