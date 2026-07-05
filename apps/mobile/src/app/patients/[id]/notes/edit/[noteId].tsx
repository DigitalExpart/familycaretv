import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GradientHeader } from '../../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../../hooks/useTheme';
import { Colors } from '../../../../../constants/theme';
import { Trash2 } from 'lucide-react-native';
import { useNote, useUpdateNote } from '../../../../../features/notes/notes-api';
import { NoteForm } from '../../../../../components/NoteForm';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';

export default function EditNoteScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('notes.edit', 'Edit Note')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <NoteForm 
          initialValues={note}
          onSubmit={handleSubmit} 
          isLoading={updateMutation.isPending} 
        />
            </ScrollView>
    </View>
    </>
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
