import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateNote } from '../../../../features/notes/notes-api';
import { NoteForm } from '../../../../components/NoteForm';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';

export default function CreateNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const createMutation = useCreateNote();

  const handleSubmit = (data: any) => {
    createMutation.mutate(
      {
        patientId: id as string,
        ...data,
      },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('notes.form.createTitle') }} />
      <ScrollView style={styles.container}>
        <NoteForm 
          onSubmit={handleSubmit} 
          isLoading={createMutation.isPending} 
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
