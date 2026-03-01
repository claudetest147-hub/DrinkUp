import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../stores/authStore';
import { View, ActivityIndicator } from 'react-native';
import { APP_THEME } from '../constants/themes';

export default function RootLayout() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: APP_THEME.colors.background 
      }}>
        <ActivityIndicator size="large" color={APP_THEME.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: APP_THEME.colors.background },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
