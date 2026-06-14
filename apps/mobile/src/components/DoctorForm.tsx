import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Doctor } from 'shared-types';

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
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      specialty: initialData?.specialty || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
    },
  });

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Doctor Name *</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            onChangeText={onChange}
            value={value}
            placeholder="Dr. Jane Smith"
          />
        )}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

      <Text style={styles.label}>Specialty</Text>
      <Controller
        control={control}
        name="specialty"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            onChangeText={onChange}
            value={value}
            placeholder="Cardiology"
          />
        )}
      />

      <Text style={styles.label}>Phone</Text>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            onChangeText={onChange}
            value={value}
            placeholder="+1 555-0123"
            keyboardType="phone-pad"
          />
        )}
      />

      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            onChangeText={onChange}
            value={value}
            placeholder="doctor@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Saving...' : 'Save Doctor'}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
