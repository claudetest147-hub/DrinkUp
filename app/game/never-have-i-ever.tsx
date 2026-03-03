import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { APP_THEME } from '../../constants/themes';
import { Player, Intensity } from '../../types';
import PaywallModal from '../../components/ui/PaywallModal';

function PlayerSetup({ onStart }: { onStart: (players: Player[], intensity: Intensity) => void }) {
  const [names, setNames] = useState<string[]>(['', '']);
  const [intensity, setIntensity] = useState<Intensity>('mild');

  const updateName = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const addPlayer = () => {
    if (names.length < 8) setNames([...names, '']);
  };

  const removeLast = () => {
    if (names.length > 2) setNames(names.slice(0, -1));
  };

  const handleStart = () => {
    const validPlayers = names
      .filter((n) => n.trim())
      .map((name, i) => ({
        id: String(i),
        name: name.trim(),
        score: 0,
        drinks: 0,
      }));

    if (validPlayers.length < 2) {
      Alert.alert('Need Players', 'Add at least 2 players!');
      return;
    }

    onStart(validPlayers, intensity);
  };

  return (
    <ScrollView style={styles.setupContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.setupTitle}>🙈 Never Have I Ever</Text>
      <Text style={styles.setupSubtitle}>Who's playing?</Text>

      {names.map((name, i) => (
        <View key={i} style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={`Player ${i + 1}`}
            placeholderTextColor={APP_THEME.colors.textSecondary}
            value={name}
            onChangeText={(text) => updateName(i, text)}
            autoCapitalize="words"
          />
        </View>
      ))}

      <View style={styles.buttonRow}>
        {names.length < 8 && (
          <TouchableOpacity onPress={addPlayer} style={styles.addBtn}>
            <Text style={styles.addText}>+ Add Player</Text>
          </TouchableOpacity>
        )}
        {names.length > 2 && (
          <TouchableOpacity onPress={removeLast} style={styles.removeBtn}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.intensityTitle}>Intensity</Text>
      <View style={styles.intensityRow}>
        {(['mild', 'spicy', 'extreme'] as Intensity[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.intensityBtn, intensity === level && styles.intensityActive]}
            onPress={() => setIntensity(level)}
          >
            <Text style={styles.intensityEmoji}>
              {level === 'mild' ? '😊' : level === 'spicy' ? '🌶️' : '🔥'}
            </Text>
            <Text style={[styles.intensityLabel, intensity === level && { color: '#FFF' }]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
        <LinearGradient colors={['#FF6B9D', '#C06C84']} style={styles.startGradient}>
          <Text style={styles.startText}>🙈 Start Game</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

function GamePlay() {
  const { session, nextCard, endGame, freeCardsUsed, showPaywall, setShowPaywall } = useGameStore();
  const { isPro } = useSubscriptionStore();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [session?.currentCardIndex]);

  if (!session) return null;

  const currentCard = session.cards[session.currentCardIndex];

  if (!currentCard) {
    return (
      <View style={styles.endContainer}>
        <Text style={styles.endEmoji}>🙈</Text>
        <Text style={styles.endTitle}>Game Over!</Text>
        <TouchableOpacity
          onPress={() => {
            endGame();
            router.back();
          }}
          style={styles.endBtn}
        >
          <Text style={styles.endBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleNext = () => {
    // Check if user hit free limit
    if (!isPro && freeCardsUsed >= 10) {
      setShowPaywall(true);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    nextCard();
    scaleAnim.setValue(0.95);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    Alert.alert('Coming Soon', 'Subscription feature will be available in the next update!');
    setShowPaywall(false);
  };

  const handleClosePaywall = () => {
    setShowPaywall(false);
    endGame();
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={handleClosePaywall}
        onSubscribe={handleSubscribe}
      />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            endGame();
            router.back();
          }}
        >
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>
          {session.currentCardIndex + 1}/{session.cards.length}
        </Text>
      </View>

      <Animated.View style={[styles.promptContainer, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient colors={['#FF6B9D', '#C06C84']} style={styles.promptCard}>
          <Text style={styles.promptEmoji}>🙈</Text>
          <Text style={styles.promptLabel}>NEVER HAVE I EVER</Text>
          <Text style={styles.promptText}>{currentCard.content}</Text>
          <Text style={styles.promptInstruction}>
            If you've done it, drink {currentCard.drink_penalty} 🍺
          </Text>
        </LinearGradient>
      </Animated.View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>Next →</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function NeverHaveIEverScreen() {
  const { session, startGame, isLoading } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);

  const handleStart = async (players: Player[], intensity: Intensity) => {
    try {
      await startGame('never_have_i_ever' as any, players, intensity);
      setGameStarted(true);
    } catch (error) {
      Alert.alert('Error', 'Using offline content');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🙈 Loading...</Text>
      </View>
    );
  }

  return gameStarted && session ? <GamePlay /> : <PlayerSetup onStart={handleStart} />;
}

const styles = StyleSheet.create({
  setupContainer: {
    flex: 1,
    backgroundColor: APP_THEME.colors.background,
    padding: 24,
    paddingTop: 60,
  },
  setupTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  setupSubtitle: {
    fontSize: 16,
    color: APP_THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  inputRow: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: APP_THEME.colors.surface,
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  addBtn: {
    backgroundColor: APP_THEME.colors.surface,
    padding: 12,
    borderRadius: 12,
    flex: 1,
  },
  addText: {
    color: APP_THEME.colors.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  removeBtn: {
    padding: 12,
    flex: 1,
  },
  removeText: {
    color: APP_THEME.colors.primary,
    textAlign: 'center',
  },
  intensityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 24,
    marginBottom: 12,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  intensityBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: APP_THEME.colors.surface,
  },
  intensityActive: {
    backgroundColor: APP_THEME.colors.primary,
  },
  intensityEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  intensityLabel: {
    color: APP_THEME.colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  startBtn: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  startGradient: {
    padding: 18,
    alignItems: 'center',
  },
  startText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: APP_THEME.colors.background,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    fontSize: 24,
    color: '#FFF',
    padding: 8,
  },
  counter: {
    color: APP_THEME.colors.textSecondary,
    fontWeight: '600',
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  promptCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  promptEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginBottom: 16,
  },
  promptText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 34,
  },
  promptInstruction: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    fontWeight: '600',
  },
  nextBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  endContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_THEME.colors.background,
  },
  endEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  endTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  endBtn: {
    marginTop: 32,
    backgroundColor: APP_THEME.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  endBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_THEME.colors.background,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 24,
  },
});
