import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors, Radii, Fonts } from '../../constants/theme';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, style, isPassword, onFocus, onBlur, ...props }, ref) => {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(isPassword ?? false);

    return (
      <View style={[styles.container, style]}>
        {label && (
          <Typography variant="caption" weight="medium" style={styles.label}>
            {label}
          </Typography>
        )}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSelected,
                color: colors.text,
                borderColor: error
                  ? colors.danger
                  : isFocused
                  ? colors.primary
                  : 'transparent',
                borderWidth: 1,
                paddingRight: isPassword ? 48 : 16,
              },
            ]}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={isSecure}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity 
              style={styles.eyeIconContainer}
              onPress={() => setIsSecure(!isSecure)}
            >
              {isSecure ? (
                <EyeOff size={20} color={colors.textSecondary} />
              ) : (
                <Eye size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Typography variant="caption" color="danger" style={styles.error}>
            {error}
          </Typography>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 56,
    borderRadius: Radii.input,
    paddingHorizontal: 16,
    fontFamily: Fonts.sans,
    fontSize: 16,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  error: {
    marginTop: 6,
  },
});
