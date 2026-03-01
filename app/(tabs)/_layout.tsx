import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { APP_THEME } from '../../constants/themes';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: APP_THEME.colors.surface,
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: APP_THEME.colors.primary,
        tabBarInactiveTintColor: APP_THEME.colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Games',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🎮</Text>,
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: 'Daily',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🔥</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
