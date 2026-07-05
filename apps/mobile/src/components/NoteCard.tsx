import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PatientNote } from 'shared-types';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/theme';

interface NoteCardProps {
  note: PatientNote;
  onPress: () => void;
}

export function NoteCard({ note, onPress }: NoteCardProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const preview = note.content.length > 100 
    ? `${note.content.substring(0, 100)}...` 
    : note.content;

  const dateStr = note.createdAt 
    ? new Date(note.createdAt).toLocaleDateString()
    : '';

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.backgroundElement }]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{note.title}</Text>
        <Text style={[styles.date, { color: theme.textSecondary }]}>{dateStr}</Text>
      </View>
      <Text style={[styles.preview, { color: theme.textSecondary }]} numberOfLines={3}>{preview}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  preview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
