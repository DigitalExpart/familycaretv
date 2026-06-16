import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDoctors } from '../../../../features/doctors/doctors-api';
import { DoctorCard } from '../../../../components/DoctorCard';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { GradientHeader } from '../../../../components/ui/GradientHeader';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { Plus } from 'lucide-react-native';

export default function DoctorsListScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { data: doctors, isLoading, error } = useDoctors(patientId as string);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title={t('doctors.title') || "Doctors"} />
      
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState message="Failed to load doctors." />
      ) : (
        <>
          <View style={[styles.header, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>{t('doctors.title') || "Doctors"}</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push(`/patients/${patientId}/doctors/create`)}
            >
              <Plus color="#FFF" size={20} />
              <Text style={styles.addButtonText}>{t('doctors.add') || "Add Doctor"}</Text>
            </TouchableOpacity>
          </View>

          {doctors?.length === 0 ? (
            <EmptyState message={t('doctors.listEmpty') || "No doctors found."} />
          ) : (
            <FlatList
              data={doctors}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DoctorCard 
                  doctor={item} 
                  onPress={() => router.push(`/patients/${patientId}/doctors/${item.id}`)} 
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
