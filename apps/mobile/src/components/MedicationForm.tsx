import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Medication } from 'shared-types';
import { useLookupMedication } from '../features/medications/medications-api';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  purpose: z.string().optional(),
  sideEffects: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface MedicationFormProps {
  initialData?: Partial<Medication>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function MedicationForm({ initialData, onSubmit, isLoading }: MedicationFormProps) {
  const { control, handleSubmit, setValue, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      dosage: initialData?.dosage || '',
      frequency: initialData?.frequency || '',
      purpose: initialData?.purpose || '',
      sideEffects: initialData?.sideEffects || '',
    },
  });

  const lookupMutation = useLookupMedication();

  const handleAiLookup = () => {
    const name = getValues('name');
    if (!name) {
      Alert.alert('Validation Error', 'Please enter a medication name first.');
      return;
    }

    lookupMutation.mutate(
      { medication: name },
      {
        onSuccess: (res) => {
          setValue('purpose', res.data.purpose);
          setValue('sideEffects', res.data.sideEffects);
          Alert.alert(
            'AI Lookup Successful',
            res.disclaimer + '\n\n' + (res.data.warnings ? `Warnings: ${res.data.warnings}` : '')
          );
        },
        onError: () => {
          Alert.alert('Lookup Failed', 'Could not retrieve information for this medication.');
        }
      }
    );
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Medication Name *</Text>
      <View style={styles.row}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.flexInput, errors.name && styles.inputError]}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. Lisinopril"
            />
          )}
        />
        <View style={styles.lookupBtn}>
          {lookupMutation.isPending ? (
            <ActivityIndicator color="#0066cc" />
          ) : (
            <Button title="AI Lookup" onPress={handleAiLookup} />
          )}
        </View>
      </View>
      {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

      <Text style={styles.label}>Dosage</Text>
      <Controller
        control={control}
        name="dosage"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            onChangeText={onChange}
            value={value}
            placeholder="e.g. 10mg"
          />
        )}
      />

      <Text style={styles.label}>Frequency</Text>
      <Controller
        control={control}
        name="frequency"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            onChangeText={onChange}
            value={value}
            placeholder="e.g. Once daily"
          />
        )}
      />

      <Text style={styles.label}>Purpose</Text>
      <Controller
        control={control}
        name="purpose"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, styles.textArea]}
            onChangeText={onChange}
            value={value}
            placeholder="What is this for?"
            multiline
            numberOfLines={3}
          />
        )}
      />

      <Text style={styles.label}>Side Effects</Text>
      <Controller
        control={control}
        name="sideEffects"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, styles.textArea]}
            onChangeText={onChange}
            value={value}
            placeholder="Potential side effects..."
            multiline
            numberOfLines={4}
          />
        )}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Saving...' : 'Save Medication'}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading || lookupMutation.isPending}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  flexInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  lookupBtn: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonContainer: {
    marginTop: 16,
  },
});
