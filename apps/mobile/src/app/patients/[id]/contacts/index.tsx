import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContacts } from '../../../../features/emergency-contacts/contacts-api';
import { ContactCard } from '../../../../components/ContactCard';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';

export default function ContactsListScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: contacts, isLoading, error } = useContacts(patientId as string);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <EmptyState message="Failed to load contacts." />;

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <Button 
          title="Add Contact" 
          onPress={() => router.push(`/patients/${patientId}/contacts/create`)} 
        />
      </View>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactCard 
            contact={item} 
            onPress={() => router.push(`/patients/${patientId}/contacts/${item.id}`)} 
          />
        )}
        ListEmptyComponent={<EmptyState message="No contacts found." />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerActions: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
