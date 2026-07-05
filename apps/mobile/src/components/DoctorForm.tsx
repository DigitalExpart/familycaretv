import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/theme';
import { Doctor } from 'shared-types';
import { useTranslation } from 'react-i18next';
import { AnimatedButton } from './ui/AnimatedButton';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface DoctorFormProps {
  initialData?: Partial<Doctor>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function DoctorForm({ initialData, onSubmit, isLoading }: DoctorFormProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: initialData?.name || '',
      specialty: initialData?.specialty || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
    },
  });

  return (
    <View style={[styles.form, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>{t('doctors.form.name', 'Doctor Name')} *</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              , errors.name && styles.inputError
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="Dr. Jane Smith"
            placeholderTextColor={theme.textSecondary}
          />
        )}
      />
      {!!errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>{t('doctors.form.specialty', 'Specialty')}</Text>
      <Controller
        control={control}
        name="specialty"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="Cardiology"
            placeholderTextColor={theme.textSecondary}
          />
        )}
      />

      <Text style={[styles.label, { color: theme.text }]}>{t('doctors.form.phone', 'Phone Number')}</Text>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="+1 555-0123"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
          />
        )}
      />
      <Text style={[styles.label, { color: theme.text }]}>{t('doctors.form.email', 'Email')}</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              , errors.email && styles.inputError
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="doctor@example.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      {!!errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      <AnimatedButton 
        title={isLoading ? t('common.loading', 'Saving...') : t('doctors.actions.save', 'Save Doctor')}
        variant="primary"
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
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
  buttonContainer: {
    marginTop: 16,
  },
});
