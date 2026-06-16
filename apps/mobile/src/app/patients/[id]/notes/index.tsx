import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotes } from '../../../../features/notes/notes-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { NoteCard } from '../../../../components/NoteCard';
import { GradientHeader } from '../../../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { Plus } from 'lucide-react-native';

export default function NotesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { data: notes, isLoading, error } = useNotes(id as string);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('notes.title') || "Patient Notes"} />
      
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState message="Error loading notes" />
      ) : (
        <>
          <View style={[styles.header, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>{t('notes.title') || "Patient Notes"}</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push(`/patients/${id}/notes/create`)}
            >
              <Plus color="#FFF" size={20} />
              <Text style={styles.addButtonText}>{t('notes.add') || "Add Note"}</Text>
            </TouchableOpacity>
          </View>

          {notes?.length === 0 ? (
            <EmptyState message={t('notes.listEmpty')} />
          ) : (
            <FlatList
              data={notes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <NoteCard 
                  note={item} 
                  onPress={() => router.push(`/patients/${id}/notes/${item.id}`)}
                />
              )}
              contentContainerStyle={styles.list}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  list: {
    paddingVertical: 8,
  },
});
