import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Event, EventType, ReminderStatus } from 'shared-types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/theme';
import DateTimePicker from './ui/JSDateTimePicker';

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
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema as any),
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

  const handleFormSubmit = (data: any) => {
    const finalData = {
      ...data,
      startDateTime: new Date(data.startDateTime).toISOString(),
    };
    onSubmit(finalData);
  };

  return (
    <View style={[styles.form, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>{t('events.form.title')} *</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              errors.title && styles.inputError
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="e.g. Dr. Smith Visit"
            placeholderTextColor={theme.textSecondary}
          />
        )}
      />
      {errors.title?.message ? <Text style={styles.errorText}>{errors.title.message as string}</Text> : null}

      <Text style={[styles.label, { color: theme.text }]}>{t('events.form.type')} *</Text>
      <View style={styles.typeContainer}>
        {EVENT_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              { borderColor: theme.primary, backgroundColor: theme.backgroundElement },
              selectedType === type && { backgroundColor: theme.primary }
            ]}
            onPress={() => setValue('type', type)}
          >
            <Text 
              style={[
                styles.typeButtonText,
                { color: theme.primary },
                selectedType === type && styles.typeButtonTextSelected
              ]}
            >
              {t(`events.types.${type}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.type?.message ? <Text style={styles.errorText}>{errors.type.message as string}</Text> : null}

      <Text style={[styles.label, { color: theme.text }]}>{t('events.form.date')} *</Text>
      <Controller
        control={control}
        name="startDateTime"
        render={({ field: { onChange, value } }) => {
          const dateVal = value ? new Date(value) : new Date();
          return (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity
                style={[styles.input, { flex: 1, backgroundColor: theme.backgroundElement, borderColor: errors.startDateTime ? '#FF3B30' : theme.border, justifyContent: 'center' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: theme.text }}>{dateVal.toLocaleDateString()}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.input, { flex: 1, backgroundColor: theme.backgroundElement, borderColor: errors.startDateTime ? '#FF3B30' : theme.border, justifyContent: 'center' }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ color: theme.text }}>{dateVal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dateVal}
                  mode="date"
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const newDate = new Date(dateVal);
                      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                      onChange(newDate.toISOString());
                    }
                  }}
                  onDismiss={() => setShowDatePicker(false)}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={dateVal}
                  mode="time"
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    setShowTimePicker(false);
                    if (selectedDate) {
                      const newDate = new Date(dateVal);
                      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
                      onChange(newDate.toISOString());
                    }
                  }}
                  onDismiss={() => setShowTimePicker(false)}
                />
              )}
            </View>
          );
        }}
      />
      {errors.startDateTime?.message ? <Text style={styles.errorText}>{errors.startDateTime.message as string}</Text> : null}

      <Text style={[styles.label, { color: theme.text }]}>{t('events.form.description')}</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              styles.textArea,
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="Details about this event..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
          />
        )}
      />

      <Text style={[styles.label, { color: theme.text }]}>{t('events.form.reminder')}</Text>
      <Controller
        control={control}
        name="reminderMinutes"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }
            ]}
            onChangeText={onChange}
            value={value?.toString()}
            placeholder="e.g. 15"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
          />
        )}
      />

      <TouchableOpacity 
        style={[styles.submitButton, { backgroundColor: theme.primary }, isLoading && { opacity: 0.7 }]}
        onPress={handleSubmit(handleFormSubmit)}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? t('common.loading') : t('common.save')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
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
});
