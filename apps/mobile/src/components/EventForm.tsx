import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Event, EventType, ReminderStatus } from 'shared-types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['APPOINTMENT', 'MEDICATION', 'TASK']),
  startDateTime: z.string().min(1, 'Start Date/Time is required'),
  reminderMinutes: z.string().optional().transform(v => v ? parseInt(v, 10) : undefined),
  status: z.enum(['ACTIVE', 'COMPLETED', 'MISSED']).optional(),
});

type FormData = z.infer<typeof schema>;

interface EventFormProps {
  initialData?: Partial<Event>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const EVENT_TYPES: EventType[] = ['APPOINTMENT', 'MEDICATION', 'TASK'];

export function EventForm({ initialData, onSubmit, isLoading }: EventFormProps) {
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || 'APPOINTMENT',
      startDateTime: initialData?.startDateTime 
        ? new Date(initialData.startDateTime).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      reminderMinutes: initialData?.reminderMinutes?.toString() || '15',
      status: initialData?.status || 'ACTIVE',
    },
  });

  const selectedType = watch('type');

  const handleFormSubmit = (data: FormData) => {
    // Convert local datetime string back to full ISO
    const finalData = {
      ...data,
      startDateTime: new Date(data.startDateTime).toISOString(),
    };
    onSubmit(finalData);
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Event Title *</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            onChangeText={onChange}
            value={value}
            placeholder="e.g. Dr. Smith Visit"
          />
        )}
      />
      {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

      <Text style={styles.label}>Type *</Text>
      <View style={styles.typeContainer}>
        {EVENT_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, selectedType === type && styles.typeButtonSelected]}
            onPress={() => setValue('type', type)}
          >
            <Text style={[styles.typeButtonText, selectedType === type && styles.typeButtonTextSelected]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.type && <Text style={styles.errorText}>{errors.type.message}</Text>}

      <Text style={styles.label}>Start Date & Time (YYYY-MM-DDTHH:mm) *</Text>
      <Controller
        control={control}
        name="startDateTime"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.startDateTime && styles.inputError]}
            onChangeText={onChange}
            value={value}
            placeholder="e.g. 2026-10-15T14:30"
          />
        )}
      />
      {errors.startDateTime && <Text style={styles.errorText}>{errors.startDateTime.message}</Text>}

      <Text style={styles.label}>Description</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, styles.textArea]}
            onChangeText={onChange}
            value={value}
            placeholder="Details about this event..."
            multiline
            numberOfLines={3}
          />
        )}
      />

      <Text style={styles.label}>Reminder (minutes before)</Text>
      <Controller
        control={control}
        name="reminderMinutes"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            onChangeText={onChange}
            value={value?.toString()}
            placeholder="e.g. 15"
            keyboardType="number-pad"
          />
        )}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Saving...' : 'Save Event'}
          onPress={handleSubmit(handleFormSubmit)}
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#0066cc',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  typeButtonSelected: {
    backgroundColor: '#0066cc',
  },
  typeButtonText: {
    color: '#0066cc',
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    marginTop: 16,
  },
});
