import React from 'react';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface JSDateTimePickerProps {
  value: Date;
  mode: 'date' | 'time';
  display?: 'default' | 'spinner' | 'clock' | 'calendar';
  is24Hour?: boolean;
  onChange?: (event: any, date?: Date) => void;
  onValueChange?: (event: any, date?: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function JSDateTimePicker({
  value,
  mode,
  display,
  is24Hour = false,
  onChange,
  onValueChange,
  minimumDate,
  maximumDate,
}: JSDateTimePickerProps) {
  
  const handleChange = (event: any, date?: Date) => {
    if (onChange) onChange(event, date);
    if (onValueChange) onValueChange(event, date);
  };

  const getDisplay = () => {
    if (display) return display;
    if (Platform.OS === 'android') {
      return mode === 'time' ? 'clock' : 'calendar';
    }
    return 'default';
  };

  return (
    <DateTimePicker
      value={value || new Date()}
      mode={mode}
      display={getDisplay()}
      is24Hour={is24Hour}
      onChange={handleChange}
      maximumDate={maximumDate}
      minimumDate={minimumDate}
    />
  );
}
