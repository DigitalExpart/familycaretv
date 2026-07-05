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
  dobMonth: z.string().min(1, 'Month is required').refine(
    (val) => { const n = parseInt(val, 10); return !isNaN(n) && n >= 1 && n <= 12; },
    { message: 'Month must be 1-12' }
  ),
  dobDay: z.string().min(1, 'Day is required').refine(
    (val) => { const n = parseInt(val, 10); return !isNaN(n) && n >= 1 && n <= 31; },
    { message: 'Day must be 1-31' }
  ),
  dobYear: z.string().min(1, 'Year is required').refine(
    (val) => { 
      const n = parseInt(val, 10); 
      const currentYear = new Date().getFullYear();
      return !isNaN(n) && n >= 1900 && n <= currentYear; 
    },
    { message: 'Enter a valid year' }
  ),
  gender: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // Cross-field validation: check that the date is actually valid
  const month = parseInt(data.dobMonth, 10);
  const day = parseInt(data.dobDay, 10);
  const year = parseInt(data.dobYear, 10);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}, {
  message: 'Invalid date. Please check month and day.',
  path: ['dobDay'],
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  initialData?: Partial<Patient>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function PatientForm({ initialData, onSubmit, isLoading }: PatientFormProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const { t } = useTranslation();

  // Parse initial date into separate fields
  const initialDate = initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : null;

  const { control, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema as any),
    defaultValues: {
      fullName: initialData?.fullName || '',
      dobMonth: initialDate ? String(initialDate.getMonth() + 1) : '',
      dobDay: initialDate ? String(initialDate.getDate()) : '',
      dobYear: initialDate ? String(initialDate.getFullYear()) : '',
      gender: initialData?.gender || '',
      notes: initialData?.notes || '',
    },
  });

  const handleFormSubmit = (data: PatientFormData) => {
    const month = parseInt(data.dobMonth, 10);
    const day = parseInt(data.dobDay, 10);
    const year = parseInt(data.dobYear, 10);
    const dateOfBirth = new Date(year, month - 1, day).toISOString();

    onSubmit({
      fullName: data.fullName,
      dateOfBirth,
      gender: data.gender,
      notes: data.notes,
    });
  };

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
      {!!errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
      {!!errors.notes && <Text style={styles.errorText}>{errors.notes.message}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>{t('patients.form.dateOfBirth')}</Text>
      <View style={styles.dobRow}>
        <View style={styles.dobField}>
          <Text style={[styles.dobLabel, { color: theme.textSecondary }]}>{t('common.month') || 'Month'}</Text>
          <Controller
            control={control}
            name="dobMonth"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.dobInput,
                  { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text },
                  errors.dobMonth && styles.inputError
                ]}
                placeholderTextColor={theme.textSecondary}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
              />
            )}
          />
        </View>

        <View style={styles.dobField}>
          <Text style={[styles.dobLabel, { color: theme.textSecondary }]}>{t('common.day') || 'Day'}</Text>
          <Controller
            control={control}
            name="dobDay"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.dobInput,
                  { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text },
                  errors.dobDay && styles.inputError
                ]}
                placeholderTextColor={theme.textSecondary}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="DD"
                keyboardType="numeric"
                maxLength={2}
              />
            )}
          />
        </View>

        <View style={[styles.dobField, { flex: 1.5 }]}>
          <Text style={[styles.dobLabel, { color: theme.textSecondary }]}>{t('common.year') || 'Year'}</Text>
          <Controller
            control={control}
            name="dobYear"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.dobInput,
                  { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text },
                  errors.dobYear && styles.inputError
                ]}
                placeholderTextColor={theme.textSecondary}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="YYYY"
                keyboardType="numeric"
                maxLength={4}
              />
            )}
          />
        </View>
      </View>
      {(errors.dobMonth || errors.dobDay || errors.dobYear) && (
        <Text style={styles.errorText}>
          {errors.dobMonth?.message || errors.dobDay?.message || errors.dobYear?.message}
        </Text>
      )}

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
        onPress={handleSubmit(handleFormSubmit)}
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
  dobRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dobField: {
    flex: 1,
  },
  dobLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  dobInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
  },
});
