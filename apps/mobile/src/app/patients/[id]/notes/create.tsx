import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GradientHeader } from '../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { Trash2 } from 'lucide-react-native';
import { useCreateNote } from '../../../../features/notes/notes-api';
import { NoteForm } from '../../../../components/NoteForm';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';

export default function CreateNoteScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Add Note" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <NoteForm 
          onSubmit={handleSubmit} 
          isLoading={createMutation.isPending} 
        />
            </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
