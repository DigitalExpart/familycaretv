import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMedications } from '../../../../features/medications/medications-api';
import { MedicationCard } from '../../../../components/MedicationCard';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { GradientHeader } from '../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { Plus } from 'lucide-react-native';

export default function MedicationsListScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: medications, isLoading, error } = useMedications(patientId as string);
  
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Medications" />

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState message="Failed to load medications." />
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MedicationCard 
              medication={item} 
              onPress={() => router.push(`/patients/${patientId}/medications/${item.id}`)} 
            />
          )}
          ListEmptyComponent={<EmptyState message="No medications found." />}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push(`/patients/${patientId}/medications/create`)}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
