import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { APP_THEME, GAME_THEMES } from '../../constants/themes';
import { GameType } from '../../types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const games = Object.entries(GAME_THEMES) as [GameType, typeof GAME_THEMES[GameType]][];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🍻 DrinkUp</Text>
        <Text style={styles.subtitle}>AI-powered party games</Text>
      </View>

      {/* Daily Pack Banner */}
      <TouchableOpacity
        style={styles.dailyBanner}
        onPress={() => router.push('/(tabs)/daily')}
      >
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dailyGradient}
        >
          <Text style={styles.dailyEmoji}>🔥</Text>
          <View>
            <Text style={styles.dailyTitle}>Today's Trending Pack</Text>
            <Text style={styles.dailySubtitle}>Fresh content daily</Text>
          </View>
          <Text style={styles.dailyArrow}>→</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Game Selection */}
      <Text style={styles.sectionTitle}>Choose Your Game</Text>
      {games.map(([gameType, config]) => (
        <TouchableOpacity
          key={gameType}
          style={styles.gameTile}
          onPress={() => router.push(`/game/${gameType.replace(/_/g, '-')}`)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gameGradient}
          >
            <Text style={styles.gameIcon}>{config.icon}</Text>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>{config.title}</Text>
              <Text style={styles.gameSubtitle}>{config.subtitle}</Text>
            </View>
            <View style={styles.playButton}>
              <Text style={styles.playText}>PLAY</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>🔥 0</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>🎮 0</Text>
          <Text style={styles.statLabel}>Games Played</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: APP_THEME.colors.textSecondary,
    marginTop: 4,
  },
  dailyBanner: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dailyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  dailyEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  dailySubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  dailyArrow: {
    fontSize: 24,
    color: '#FFF',
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  gameTile: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gameGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  gameIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  gameSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  playText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  statBox: {
    flex: 1,
    backgroundColor: APP_THEME.colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: APP_THEME.colors.textSecondary,
    marginTop: 4,
  },
});
