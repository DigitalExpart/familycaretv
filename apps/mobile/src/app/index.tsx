import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Animated, Easing } from 'react-native';

import { Typography } from '../components/ui/Typography';
import { Colors } from '../constants/theme';

export default function SplashScreen() {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, [opacity, scale]);

  return (
    <LinearGradient
      colors={['#EEF2FF', '#E0E7FF', '#C7D2FE']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={{ width: 80, height: 80 }} 
            resizeMode="contain" 
          />
        </View>
        
        <Typography variant="h1" color="primary" style={styles.title}>
          FamilyCare TV
        </Typography>
        
        <Typography variant="body" color="secondary" style={styles.subtitle}>
          Care, Connection & Wellness
        </Typography>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
    fontSize: 36,
  },
  subtitle: {
    fontSize: 18,
    letterSpacing: 0.5,
  }
});
