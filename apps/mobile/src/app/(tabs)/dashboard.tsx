import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome {user?.firstName || user?.email}</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Events</Text>
        <Text style={styles.placeholder}>No events scheduled for today.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Events</Text>
        <Text style={styles.placeholder}>No upcoming events.</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Manage Patients" onPress={() => router.push('/patients')} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  greeting: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  placeholder: { color: '#666' }
});
