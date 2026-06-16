import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/theme';
import { z } from 'zod';
import { PatientNote } from 'shared-types';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

type FormData = z.infer<typeof schema>;

interface NoteFormProps {
  initialValues?: Partial<PatientNote>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function NoteForm({ initialValues, onSubmit, isLoading }: NoteFormProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const { t } = useTranslation();
  
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialValues?.title || '',
      content: initialValues?.content || '',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{t('notes.form.titleLabel')}</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              
            ]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={t('notes.form.titlePlaceholder')}
          />
        )}
      />
      {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>{t('notes.form.contentLabel')}</Text>
      <Controller
        control={control}
        name="content"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              , styles.textArea
            ]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={t('notes.form.contentPlaceholder')}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        )}
      />
      {errors.content && <Text style={styles.errorText}>{errors.content.message}</Text>}

      <TouchableOpacity 
        style={[styles.submitButton, { backgroundColor: theme.primary }, isLoading && { opacity: 0.7 }]}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Saving...' : t('notes.actions.save')}
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
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    fontSize: 16,
  },
  textArea: {
    height: 150,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
