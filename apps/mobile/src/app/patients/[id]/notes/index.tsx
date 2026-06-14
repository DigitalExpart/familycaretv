import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotes } from '../../../../features/notes/notes-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { NoteCard } from '../../../../components/NoteCard';
import { useTranslation } from 'react-i18next';

export default function NotesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: notes, isLoading, error } = useNotes(id as string);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <EmptyState message="Error loading notes" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('notes.list.title')}</Text>
        <Button 
          title={t('notes.list.create')} 
          onPress={() => router.push(`/patients/${id}/notes/create`)} 
        />
      </View>

      {notes?.length === 0 ? (
        <EmptyState message={t('notes.list.empty')} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    paddingVertical: 8,
  },
});
