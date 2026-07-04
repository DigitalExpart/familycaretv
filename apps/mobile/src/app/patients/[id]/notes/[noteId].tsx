import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNote, useDeleteNote } from '../../../../features/notes/notes-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../components/ui/Button';

export default function NoteDetailScreen() {
  const { id, noteId } = useLocalSearchParams<{ id: string, noteId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  
  const { data: note, isLoading, error } = useNote(noteId as string);
  const deleteMutation = useDeleteNote();

  if (isLoading) return <LoadingSpinner />;
  if (error || !note) return <EmptyState message="Note not found" />;

  const dateStr = note.createdAt 
    ? new Date(note.createdAt).toLocaleDateString()
    : '';

  const handleDelete = () => {
    Alert.alert(
      t('notes.actions.delete'),
      t('notes.actions.confirmDelete'),
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            deleteMutation.mutate(note.id, {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.content}>{note.content}</Text>
      </View>

      <View style={styles.actions}>
        <Button 
          title={t('notes.actions.edit')} 
          onPress={() => router.push(`/patients/${id}/notes/edit/${note.id}`)} 
        />
        <View style={{ height: 16 }} />
        <Button 
          title={t('notes.actions.delete')} 
          variant="danger" 
          onPress={handleDelete} 
          disabled={deleteMutation.isPending}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    minHeight: 150,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actions: {
    padding: 20,
    marginTop: 8,
  },
});
