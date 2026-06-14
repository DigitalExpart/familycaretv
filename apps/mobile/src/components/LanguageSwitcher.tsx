import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('settings.language')}:</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.button, i18n.language.startsWith('en') && styles.activeButton]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text style={[styles.buttonText, i18n.language.startsWith('en') && styles.activeButtonText]}>
            {t('settings.english')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, i18n.language.startsWith('es') && styles.activeButton]}
          onPress={() => handleLanguageChange('es')}
        >
          <Text style={[styles.buttonText, i18n.language.startsWith('es') && styles.activeButtonText]}>
            {t('settings.spanish')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0066cc',
    marginRight: 12,
  },
  activeButton: {
    backgroundColor: '#0066cc',
  },
  buttonText: {
    color: '#0066cc',
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#fff',
  },
});
