import { Stack } from 'expo-router';
import { APP_THEME } from '../../constants/themes';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: APP_THEME.colors.background },
        animation: 'slide_from_bottom',
      }}
    />
  );
}
