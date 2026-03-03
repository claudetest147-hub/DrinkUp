import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_THEME } from '../../constants/themes';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalDrinks: 0,
    favoriteGame: 'truth_or_dare',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setStats({
          gamesPlayed: data.total_games_played || 0,
          currentStreak: data.current_streak || 0,
          longestStreak: data.longest_streak || 0,
          totalDrinks: 0, // Would come from game_sessions
          favoriteGame: 'truth_or_dare',
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.is_pro || false;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proText}>👑 PRO</Text>
          </View>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.gamesPlayed}</Text>
          <Text style={styles.statLabel}>Games Played</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>🔥 {stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>⭐ {stats.longestStreak}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>🍺 {stats.totalDrinks}</Text>
          <Text style={styles.statLabel}>Total Sips</Text>
        </View>
      </View>

      {/* Upgrade to Pro */}
      {!isPro && (
        <TouchableOpacity style={styles.upgradeCard}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.upgradeGradient}
          >
            <Text style={styles.upgradeEmoji}>👑</Text>
            <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
            <Text style={styles.upgradeSubtitle}>
              Unlimited cards • Extreme mode • Custom packs
            </Text>
            <View style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>$5.99/month</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>📊 View Detailed Stats</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>🔔 Notifications</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>🎨 Theme Settings</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>ℹ️ About DrinkUp</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>📧 Support</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <Text style={styles.version}>DrinkUp v1.0.0</Text>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  proBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  proText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: APP_THEME.colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: APP_THEME.colors.textSecondary,
    textAlign: 'center',
  },
  upgradeCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  upgradeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  upgradeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  upgradeSubtitle: {
    fontSize: 14,
    color: 'rgba(26,26,46,0.7)',
    marginBottom: 16,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: 'rgba(26,26,46,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: APP_THEME.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#FFF',
  },
  settingArrow: {
    fontSize: 18,
    color: APP_THEME.colors.textSecondary,
  },
  version: {
    fontSize: 12,
    color: APP_THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
