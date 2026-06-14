import React from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
      <Text style={styles.label}>{t('notes.form.titleLabel')}</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={t('notes.form.titlePlaceholder')}
          />
        )}
      />
      {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

      <Text style={styles.label}>{t('notes.form.contentLabel')}</Text>
      <Controller
        control={control}
        name="content"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, styles.textArea]}
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

      <View style={styles.buttonContainer}>
        <Button 
          title={isLoading ? 'Saving...' : t('notes.actions.save')} 
          onPress={handleSubmit(onSubmit)} 
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
