import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';
import { APP_THEME } from '../constants/themes';

export default function Index() {
  const { user, initialize } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      // Initialize auth
      await initialize();

      // Check if first launch
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      if (!hasSeenOnboarding) {
        // First launch - show onboarding
        router.replace('/onboarding');
      } else if (user) {
        // Returning user with account - go to home
        router.replace('/(tabs)/home');
      } else {
        // Returning user without account - show auth
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      // On error, show onboarding
      router.replace('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_THEME.colors.background }}>
        <ActivityIndicator size="large" color={APP_THEME.colors.primary} />
      </View>
    );
  }

  return null;
}
