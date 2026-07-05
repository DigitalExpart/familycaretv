import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateEvent } from '../../../../features/events/events-api';
import { EventForm } from '../../../../components/EventForm';
import { GradientHeader } from '../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';

export default function CreateEventScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const createMutation = useCreateEvent();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { t } = useTranslation();

  const handleSubmit = (data: any) => {
    createMutation.mutate(
      { ...data, patientId },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('events.add', 'Add Event') }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <GradientHeader title={t('events.add', 'Add Event')} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <EventForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
