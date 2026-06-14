import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContact, useUpdateContact } from '../../../../features/emergency-contacts/contacts-api';
import { ContactForm } from '../../../../components/ContactForm';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';

export default function EditContactScreen() {
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
    <ScrollView style={styles.container}>
      <ContactForm 
        initialData={contact}
        onSubmit={handleSubmit} 
        isLoading={updateMutation.isPending} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
