import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNote, useUpdateNote } from '../../../../../features/notes/notes-api';
import { NoteForm } from '../../../../../components/NoteForm';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';

export default function EditNoteScreen() {
  const { id, noteId } = useLocalSearchParams<{ id: string, noteId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  
  const { data: note, isLoading, error } = useNote(noteId as string);
  const updateMutation = useUpdateNote();

  if (isLoading) return <LoadingSpinner />;
  if (error || !note) return <EmptyState message="Note not found" />;

  const handleSubmit = (data: any) => {
    updateMutation.mutate(
      {
        id: note.id,
        patientId: note.patientId, // needed for cache invalidation
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
      <Stack.Screen options={{ title: t('notes.form.editTitle') }} />
      <ScrollView style={styles.container}>
        <NoteForm 
          initialValues={note}
          onSubmit={handleSubmit} 
          isLoading={updateMutation.isPending} 
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
