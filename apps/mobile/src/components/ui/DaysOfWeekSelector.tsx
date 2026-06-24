import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface DaysOfWeekSelectorProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
}

const DAYS = [
  { label: 'S', value: 'Sunday' },
  { label: 'M', value: 'Monday' },
  { label: 'T', value: 'Tuesday' },
  { label: 'W', value: 'Wednesday' },
  { label: 'T', value: 'Thursday' },
  { label: 'F', value: 'Friday' },
  { label: 'S', value: 'Saturday' },
];

export function DaysOfWeekSelector({ selectedDays, onChange }: DaysOfWeekSelectorProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const toggleDay = (dayValue: string) => {
    if (selectedDays.includes(dayValue)) {
      onChange(selectedDays.filter((d) => d !== dayValue));
    } else {
      onChange([...selectedDays, dayValue]);
    }
  };

  return (
    <View style={styles.container}>
      {DAYS.map((day, idx) => {
        const isSelected = selectedDays.includes(day.value);
        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.dayCircle,
              { backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary },
            ]}
            onPress={() => toggleDay(day.value)}
          >
            <Text
              style={[
                styles.dayText,
                { color: isSelected ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
