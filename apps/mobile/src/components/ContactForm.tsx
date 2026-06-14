import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmergencyContact } from 'shared-types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone is required'),
});

type FormData = z.infer<typeof schema>;

interface ContactFormProps {
  initialData?: Partial<EmergencyContact>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function ContactForm({ initialData, onSubmit, isLoading }: ContactFormProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      relationship: initialData?.relationship || '',
      phone: initialData?.phone || '',
    },
  });

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Contact Name *</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            onChangeText={onChange}
            value={value}
            placeholder="John Doe"
          />
        )}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

      <Text style={styles.label}>Relationship *</Text>
      <Controller
        control={control}
        name="relationship"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.relationship && styles.inputError]}
            onChangeText={onChange}
            value={value}
            placeholder="Son, Daughter, Friend..."
          />
        )}
      />
      {errors.relationship && <Text style={styles.errorText}>{errors.relationship.message}</Text>}

      <Text style={styles.label}>Phone *</Text>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            onChangeText={onChange}
            value={value}
            placeholder="+1 555-0123"
            keyboardType="phone-pad"
          />
        )}
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Saving...' : 'Save Contact'}
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
