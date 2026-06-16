import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/theme';
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
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      relationship: initialData?.relationship || '',
      phone: initialData?.phone || '',
    },
  });

  return (
    <View style={[styles.form, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>Contact Name *</Text>
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
            placeholder="John Doe"
            placeholderTextColor={theme.textSecondary}
          />
        )}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>Relationship *</Text>
      <Controller
        control={control}
        name="relationship"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              , errors.relationship && styles.inputError
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="Son, Daughter, Friend..."
            placeholderTextColor={theme.textSecondary}
          />
        )}
      />
      {errors.relationship && <Text style={styles.errorText}>{errors.relationship.message}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>Phone *</Text>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              , errors.phone && styles.inputError
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="+1 555-0123"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
          />
        )}
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

      <TouchableOpacity 
        style={[styles.submitButton, { backgroundColor: theme.primary }, isLoading && { opacity: 0.7 }]}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Saving...' : 'Save Contact'}
        </Text>
      </TouchableOpacity>
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
