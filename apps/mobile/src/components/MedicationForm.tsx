import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Button, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/theme';
import { Medication } from 'shared-types';
import { useLookupMedication } from '../features/medications/medications-api';
import { useTranslation } from 'react-i18next';
import { AnimatedButton } from './ui/AnimatedButton';
import DateTimePicker from './ui/JSDateTimePicker';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  dosage: z.string().optional(),
  purpose: z.string().optional(),
  sideEffects: z.string().optional(),
  daysOfWeek: z.array(z.string()).optional(),
  timesOfDay: z.array(z.string()).optional(),
  durationWeeks: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface MedicationFormProps {
  initialData?: Partial<Medication> & { daysOfWeek?: string[]; timesOfDay?: string[]; durationWeeks?: number };
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function MedicationForm({ initialData, onSubmit, isLoading }: MedicationFormProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [showLimitModal, setShowLimitModal] = React.useState(false);

  const { control, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: initialData?.name || '',
      dosage: initialData?.dosage || '',
      purpose: initialData?.purpose || '',
      sideEffects: initialData?.sideEffects || '',
      daysOfWeek: initialData?.daysOfWeek || [],
      timesOfDay: initialData?.timesOfDay || [],
      durationWeeks: initialData?.durationWeeks?.toString() || '',
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      durationWeeks: data.durationWeeks ? parseInt(data.durationWeeks, 10) : undefined,
    });
  };

  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const daysOfWeek = watch('daysOfWeek') || [];
  const timesOfDay = watch('timesOfDay') || [];

  const toggleDay = (day: string) => {
    if (day === 'Everyday') {
      setValue('daysOfWeek', ['Everyday']);
      return;
    }
    let newDays = [...daysOfWeek].filter(d => d !== 'Everyday');
    if (newDays.includes(day)) {
      newDays = newDays.filter(d => d !== day);
    } else {
      newDays.push(day);
    }
    setValue('daysOfWeek', newDays);
  };

  const removeTime = (index: number) => {
    const newTimes = [...timesOfDay];
    newTimes.splice(index, 1);
    setValue('timesOfDay', newTimes);
  };

  const handleTimePick = (event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!timesOfDay.includes(timeString)) {
        setValue('timesOfDay', [...timesOfDay, timeString]);
      }
    }
  };

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
        onError: (error: any) => {
          if (error?.response?.status === 403) {
            setShowLimitModal(true);
          } else {
            Alert.alert('Lookup Failed', 'Could not retrieve information for this medication.');
          }
        }
      }
    );
  };

  return (
    <View style={[styles.form, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>{t('medications.form.name', 'Medication Name')} *</Text>
      <View style={styles.row}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
                styles.flexInput, 
                errors.name && styles.inputError
              ]}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. Lisinopril"
              placeholderTextColor={theme.textSecondary}
            />
          )}
        />
        <View style={styles.lookupBtn}>
          {lookupMutation.isPending ? (
            <ActivityIndicator color="#0066cc" />
          ) : (
            <Button title={t('medications.aiLookup', 'AI Lookup')} onPress={handleAiLookup} />
          )}
        </View>
      </View>
      {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

      <Text style={[styles.label, { color: theme.text }]}>{t('medications.form.dosage', 'Dosage')}</Text>
      <Controller
        control={control}
        name="dosage"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="e.g. 10mg"
            placeholderTextColor={theme.textSecondary}
          />
        )}
      />

      <Text style={[styles.label, { color: theme.text }]}>{t('medications.form.scheduleDays', 'Schedule - Days of Week')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {['Everyday', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => toggleDay(day)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 20,
              backgroundColor: daysOfWeek.includes(day) ? theme.primary : theme.backgroundElement,
              borderWidth: 1,
              borderColor: daysOfWeek.includes(day) ? theme.primary : theme.border,
            }}
          >
            <Text style={{ color: daysOfWeek.includes(day) ? '#fff' : theme.text }}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.text }]}>{t('medications.form.scheduleTimes', 'Schedule - Times of Day')}</Text>
      <View style={{ marginBottom: 16 }}>
        {timesOfDay.map((time, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: theme.backgroundElement, padding: 12, borderRadius: 8 }}>
            <Text style={{ flex: 1, color: theme.text, fontSize: 16 }}>{time}</Text>
            <TouchableOpacity onPress={() => removeTime(index)}>
              <Text style={{ color: 'red' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <Button title="+ Add Time" onPress={() => setShowTimePicker(true)} />
        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={false}
            display="default"
            onValueChange={handleTimePick}
          />
        )}
      </View>

      <Text style={[styles.label, { color: theme.text }]}>{t('medications.form.purpose', 'Purpose')}</Text>
      <Controller
        control={control}
        name="purpose"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              , styles.textArea
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="What is this for?"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
          />
        )}
      />

      <Text style={[styles.label, { color: theme.text }]}>{t('medications.form.sideEffects', 'Side Effects')}</Text>
      <Controller
        control={control}
        name="sideEffects"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
              , styles.textArea
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="Potential side effects..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
          />
        )}
      />

      <Text style={[styles.label, { color: theme.text }]}>{t('medications.form.duration', 'Duration (Weeks)')}</Text>
      <Controller
        control={control}
        name="durationWeeks"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
            ]}
            onChangeText={onChange}
            value={value}
            placeholder="e.g. 2 (Leave blank for ongoing)"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
          />
        )}
      />

      <AnimatedButton 
        title={isLoading ? t('common.loading', 'Saving...') : t('medications.actions.save', 'Save Medication')}
        variant="primary"
        onPress={handleSubmit(handleFormSubmit)}
        disabled={isLoading || lookupMutation.isPending}
        style={{ marginTop: 8 }}
      />

      <Modal
        visible={showLimitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLimitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Daily Limit Reached</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              Your 3 daily free uses for AI Lookup have expired. Subscribe to get unlimited access!
            </Text>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowLimitModal(false);
                router.push('/(tabs)/subscription');
              }}
            >
              <Text style={styles.modalButtonText}>Subscribe for More</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowLimitModal(false)}
            >
              <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCancelButton: {
    padding: 12,
  },
});
