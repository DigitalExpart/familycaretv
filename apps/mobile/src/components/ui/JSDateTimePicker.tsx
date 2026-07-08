import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface JSDateTimePickerProps {
  value: Date;
  mode: 'date' | 'time';
  display?: string;
  is24Hour?: boolean;
  onChange?: (event: any, date?: Date) => void;
  onValueChange?: (event: any, date?: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function JSDateTimePicker({
  value,
  mode,
  onChange,
  onValueChange,
  minimumDate,
  maximumDate,
}: JSDateTimePickerProps) {
  const [currentDate, setCurrentDate] = useState<Date>(value || new Date());

  const handleConfirm = () => {
    if (onChange) onChange({ type: 'set' }, currentDate);
    if (onValueChange) onValueChange({ type: 'set' }, currentDate);
  };

  const handleCancel = () => {
    if (onChange) onChange({ type: 'dismissed' });
    if (onValueChange) onValueChange({ type: 'dismissed' });
  };

  if (mode === 'date') {
    return (
      <Modal transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Calendar
              current={currentDate.toISOString()}
              minDate={minimumDate ? minimumDate.toISOString() : undefined}
              maxDate={maximumDate ? maximumDate.toISOString() : undefined}
              onDayPress={(day: any) => {
                const newDate = new Date(day.timestamp);
                newDate.setHours(currentDate.getHours());
                newDate.setMinutes(currentDate.getMinutes());
                setCurrentDate(newDate);
              }}
              theme={{
                todayTextColor: '#0066cc',
                selectedDayBackgroundColor: '#0066cc',
              }}
              markedDates={{
                [currentDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#0066cc' },
              }}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleConfirm}>
                <Text style={styles.primaryButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Time Mode - Simple Picker
  const hours = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  const [selHour, setSelHour] = useState(
    currentDate.getHours() % 12 === 0 ? 12 : currentDate.getHours() % 12
  );
  const [selMin, setSelMin] = useState(currentDate.getMinutes());
  const [selPeriod, setSelPeriod] = useState(currentDate.getHours() >= 12 ? 'PM' : 'AM');

  const updateTime = (h: number, m: number, p: string) => {
    let rawHour = h;
    if (p === 'PM' && h !== 12) rawHour += 12;
    if (p === 'AM' && h === 12) rawHour = 0;
    
    const newDate = new Date(currentDate);
    newDate.setHours(rawHour);
    newDate.setMinutes(m);
    setCurrentDate(newDate);
  };

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select Time</Text>
          <View style={styles.pickerRow}>
            {/* Hours */}
            <ScrollView style={styles.scrollCol} showsVerticalScrollIndicator={false}>
              {hours.map(h => (
                <TouchableOpacity 
                  key={`h-${h}`} 
                  style={[styles.timeItem, selHour === h && styles.selectedTimeItem]}
                  onPress={() => { setSelHour(h); updateTime(h, selMin, selPeriod); }}
                >
                  <Text style={[styles.timeText, selHour === h && styles.selectedTimeText]}>
                    {h.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.colon}>:</Text>
            
            {/* Minutes */}
            <ScrollView style={styles.scrollCol} showsVerticalScrollIndicator={false}>
              {minutes.map(m => (
                <TouchableOpacity 
                  key={`m-${m}`} 
                  style={[styles.timeItem, selMin === m && styles.selectedTimeItem]}
                  onPress={() => { setSelMin(m); updateTime(selHour, m, selPeriod); }}
                >
                  <Text style={[styles.timeText, selMin === m && styles.selectedTimeText]}>
                    {m.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* AM/PM */}
            <View style={styles.amPmCol}>
              {periods.map(p => (
                <TouchableOpacity 
                  key={p} 
                  style={[styles.timeItem, selPeriod === p && styles.selectedTimeItem]}
                  onPress={() => { setSelPeriod(p); updateTime(selHour, selMin, p); }}
                >
                  <Text style={[styles.timeText, selPeriod === p && styles.selectedTimeText]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleConfirm}>
              <Text style={styles.primaryButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  pickerRow: {
    flexDirection: 'row',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scrollCol: {
    width: 60,
  },
  amPmCol: {
    width: 60,
    justifyContent: 'center',
  },
  timeItem: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTimeItem: {
    backgroundColor: '#0066cc',
  },
  timeText: {
    fontSize: 18,
    color: '#666',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  colon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#0066cc',
  },
  buttonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
