import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateContact } from '../../../../features/emergency-contacts/contacts-api';
import { ContactForm } from '../../../../components/ContactForm';

export default function CreateContactScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const createMutation = useCreateContact();

  const handleSubmit = (data: any) => {
    createMutation.mutate(
      { ...data, patientId },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ContactForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
