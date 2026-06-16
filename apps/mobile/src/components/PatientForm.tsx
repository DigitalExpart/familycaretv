import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Patient } from 'shared-types';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/theme';
import { AnimatedButton } from './ui/AnimatedButton';
import { useTranslation } from 'react-i18next';

const patientSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  initialData?: Partial<Patient>;
  onSubmit: (data: PatientFormData) => void;
  isLoading?: boolean;
}

export function PatientForm({ initialData, onSubmit, isLoading }: PatientFormProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { t } = useTranslation();

  const { control, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
      gender: initialData?.gender || '',
      notes: initialData?.notes || '',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{t('patients.form.fullName')}</Text>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text },
              errors.fullName && styles.inputError
            ]}
            placeholderTextColor={theme.textSecondary}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="John Doe"
          />
        )}
      />
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>{t('patients.form.dateOfBirth')} (YYYY-MM-DD)</Text>
      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text },
              errors.dateOfBirth && styles.inputError
            ]}
            placeholderTextColor={theme.textSecondary}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="1990-01-01"
          />
        )}
      />
      {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>{t('patients.form.gender')}</Text>
      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text }
            ]}
            placeholderTextColor={theme.textSecondary}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Male / Female / Other"
          />
        )}
      />

      <Text style={[styles.label, { color: theme.text }]}>{t('patients.form.notes')}</Text>
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input, 
              styles.textArea,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text }
            ]}
            placeholderTextColor={theme.textSecondary}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={t('patients.form.notes')}
            multiline
            numberOfLines={4}
          />
        )}
      />

      <AnimatedButton 
        title={isLoading ? t('common.loading') : t('common.save')}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: -12,
    marginBottom: 16,
    fontSize: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
