import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { APP_THEME } from '../../constants/themes';
import { supabase } from '../../lib/supabase';

interface DailyPack {
  id: string;
  name: string;
  game_type: string;
  trending_topic: string;
  play_count: number;
  created_at: string;
  card_count: number;
}

export default function DailyScreen() {
  const [packs, setPacks] = useState<DailyPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDailyPacks();
  }, []);

  const loadDailyPacks = async () => {
    try {
      // Get today's packs
      const { data, error } = await supabase
        .from('cards')
        .select('game_type, trending_topic, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by game_type and trending_topic
      const grouped = (data || []).reduce((acc: any, card: any) => {
        const key = `${card.game_type}-${card.trending_topic || 'general'}`;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            name: `${formatGameType(card.game_type)}`,
            game_type: card.game_type,
            trending_topic: card.trending_topic || 'General',
            play_count: 0,
            created_at: card.created_at,
            card_count: 0,
          };
        }
        acc[key].card_count++;
        return acc;
      }, {});

      const packsList = Object.values(grouped) as DailyPack[];
      setPacks(packsList);
    } catch (error) {
      console.error('Error loading daily packs:', error);
      // Show fallback packs
      setPacks([
        {
          id: '1',
          name: 'Truth or Dare',
          game_type: 'truth_or_dare',
          trending_topic: 'Trending Now',
          play_count: 0,
          created_at: new Date().toISOString(),
          card_count: 15,
        },
        {
          id: '2',
          name: 'Would You Rather',
          game_type: 'would_you_rather',
          trending_topic: 'Popular Today',
          play_count: 0,
          created_at: new Date().toISOString(),
          card_count: 10,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatGameType = (type: string): string => {
    const names: Record<string, string> = {
      truth_or_dare: 'Truth or Dare',
      would_you_rather: 'Would You Rather',
      most_likely_to: 'Most Likely To',
      never_have_i_ever: 'Never Have I Ever',
    };
    return names[type] || type;
  };

  const getGameIcon = (type: string): string => {
    const icons: Record<string, string> = {
      truth_or_dare: '🎭',
      would_you_rather: '⚡',
      most_likely_to: '👆',
      never_have_i_ever: '🙈',
    };
    return icons[type] || '🎮';
  };

  const getGameGradient = (type: string): string[] => {
    const gradients: Record<string, string[]> = {
      truth_or_dare: ['#667eea', '#764ba2'],
      would_you_rather: ['#4facfe', '#00f2fe'],
      most_likely_to: ['#43e97b', '#38f9d7'],
      never_have_i_ever: ['#FF6B9D', '#C06C84'],
    };
    return gradients[type] || ['#667eea', '#764ba2'];
  };

  const handlePackPress = (pack: DailyPack) => {
    // Navigate to game with this pack
    router.push(`/game/${pack.game_type.replace(/_/g, '-')}`);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDailyPacks();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={APP_THEME.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Daily Fresh</Text>
        <Text style={styles.subtitle}>New content every day</Text>
      </View>

      {/* Today's Date */}
      <View style={styles.dateCard}>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Packs */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading today's packs...</Text>
        </View>
      ) : packs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyText}>No packs available yet</Text>
          <Text style={styles.emptySubtext}>Check back soon for fresh content!</Text>
        </View>
      ) : (
        packs.map((pack) => (
          <TouchableOpacity
            key={pack.id}
            style={styles.packCard}
            onPress={() => handlePackPress(pack)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={getGameGradient(pack.game_type)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.packGradient}
            >
              <View style={styles.packHeader}>
                <Text style={styles.packIcon}>{getGameIcon(pack.game_type)}</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newText}>NEW</Text>
                </View>
              </View>
              
              <Text style={styles.packName}>{pack.name}</Text>
              <Text style={styles.packTopic}>🔥 {pack.trending_topic}</Text>
              
              <View style={styles.packFooter}>
                <Text style={styles.packCards}>{pack.card_count} cards</Text>
                <View style={styles.playButton}>
                  <Text style={styles.playButtonText}>PLAY →</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 How It Works</Text>
        <Text style={styles.infoText}>
          Every day at 6 AM, fresh content is generated using trending topics from social media.
          Come back daily for new, culturally relevant game prompts!
        </Text>
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: APP_THEME.colors.textSecondary,
    marginTop: 4,
  },
  dateCard: {
    backgroundColor: APP_THEME.colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_THEME.colors.secondary,
    textAlign: 'center',
  },
  packCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  packGradient: {
    padding: 20,
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packIcon: {
    fontSize: 32,
  },
  newBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  packName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  packTopic: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  packFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packCards: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: APP_THEME.colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: APP_THEME.colors.textSecondary,
  },
  infoCard: {
    backgroundColor: APP_THEME.colors.surface,
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: APP_THEME.colors.textSecondary,
    lineHeight: 20,
  },
});
