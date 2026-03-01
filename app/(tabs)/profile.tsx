import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { APP_THEME } from '../../constants/themes';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>
      <Text style={styles.subtitle}>Settings coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: APP_THEME.colors.textSecondary,
  },
});
