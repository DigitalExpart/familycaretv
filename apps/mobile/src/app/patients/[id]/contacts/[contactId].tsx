import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContact, useDeleteContact } from '../../../../features/emergency-contacts/contacts-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';

export default function ContactDetailsScreen() {
  const { id: patientId, contactId } = useLocalSearchParams<{ id: string; contactId: string }>();
  const router = useRouter();
  
  const { data: contact, isLoading, error } = useContact(contactId as string);
  const deleteMutation = useDeleteContact();

  if (isLoading) return <LoadingSpinner />;
  if (error || !contact) return <EmptyState message="Contact not found." />;

  const handleDelete = () => {
    Alert.alert(
      "Remove Contact",
      "Are you sure you want to remove this contact?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: () => {
            deleteMutation.mutate({ id: contact.id, patientId: patientId as string }, {
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
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.relationship}>{contact.relationship}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{contact.phone}</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Edit Contact" onPress={() => router.push(`/patients/${patientId}/contacts/edit/${contact.id}`)} />
        <View style={{ height: 16 }} />
        <Button title="Remove Contact" color="red" onPress={handleDelete} />
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
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  relationship: {
    fontSize: 16,
    color: '#e65c00',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    padding: 20,
    marginTop: 20,
  },
});
