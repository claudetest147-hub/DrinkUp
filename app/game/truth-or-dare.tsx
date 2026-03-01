import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { APP_THEME } from '../../constants/themes';
import { Player, Intensity } from '../../types';

const { width, height } = Dimensions.get('window');

// Player setup component
function PlayerSetup({ onStart }: { onStart: (players: Player[], intensity: Intensity) => void }) {
  const [names, setNames] = useState<string[]>(['', '']);
  const [intensity, setIntensity] = useState<Intensity>('mild');

  const updateName = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const addPlayer = () => setNames([...names, '']);
  const removeLast = () => names.length > 2 && setNames(names.slice(0, -1));

  const handleStart = () => {
    const validPlayers = names
      .filter(n => n.trim())
      .map((name, i) => ({
        id: String(i),
        name: name.trim(),
        score: 0,
        drinks: 0,
      }));

    if (validPlayers.length < 2) {
      Alert.alert('Need Players', 'Add at least 2 player names to start!');
      return;
    }

    onStart(validPlayers, intensity);
  };

  return (
    <View style={setupStyles.container}>
      <Text style={setupStyles.title}>🎭 Truth or Dare</Text>
      <Text style={setupStyles.subtitle}>Who's playing?</Text>

      {names.map((name, i) => (
        <TextInput
          key={i}
          style={setupStyles.input}
          placeholder={`Player ${i + 1}`}
          placeholderTextColor={APP_THEME.colors.textSecondary}
          value={name}
          onChangeText={(value) => updateName(i, value)}
        />
      ))}

      <View style={setupStyles.buttonRow}>
        <TouchableOpacity onPress={addPlayer} style={setupStyles.addBtn}>
          <Text style={setupStyles.addText}>+ Add Player</Text>
        </TouchableOpacity>
        {names.length > 2 && (
          <TouchableOpacity onPress={removeLast} style={setupStyles.removeBtn}>
            <Text style={setupStyles.removeText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={setupStyles.intensityTitle}>Intensity</Text>
      <View style={setupStyles.intensityRow}>
        {(['mild', 'spicy', 'extreme'] as Intensity[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              setupStyles.intensityBtn,
              intensity === level && setupStyles.intensityActive,
            ]}
            onPress={() => setIntensity(level)}
          >
            <Text style={setupStyles.intensityEmoji}>
              {level === 'mild' ? '😊' : level === 'spicy' ? '🌶️' : '🔥'}
            </Text>
            <Text
              style={[
                setupStyles.intensityLabel,
                intensity === level && { color: '#FFF' },
              ]}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={setupStyles.startBtn} onPress={handleStart}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={setupStyles.startGradient}>
          <Text style={setupStyles.startText}>🎉 Start Game</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// Main gameplay component
function GamePlay() {
  const { session, nextCard, nextPlayer, endGame } = useGameStore();
  const [showingChoice, setShowingChoice] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [session?.currentCardIndex]);

  if (!session) return null;

  const currentCard = session.cards[session.currentCardIndex];
  const currentPlayer = session.players[session.currentPlayerIndex];

  if (!currentCard) {
    return (
      <View style={playStyles.endContainer}>
        <Text style={playStyles.endEmoji}>🎉</Text>
        <Text style={playStyles.endTitle}>Game Over!</Text>
        <Text style={playStyles.endSubtitle}>That was wild!</Text>
        <TouchableOpacity
          style={playStyles.endBtn}
          onPress={() => {
            endGame();
            router.back();
          }}
        >
          <Text style={playStyles.endBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleChoice = (choice: 'truth' | 'dare') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowingChoice(false);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowingChoice(true);
    nextCard();
    nextPlayer();
    scaleAnim.setValue(0.9);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={playStyles.container}>
      {/* Header */}
      <View style={playStyles.header}>
        <TouchableOpacity
          onPress={() => {
            endGame();
            router.back();
          }}
        >
          <Text style={playStyles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={playStyles.counter}>
          {session.currentCardIndex + 1} / {session.cards.length}
        </Text>
        <View style={playStyles.drinkBadge}>
          <Text style={playStyles.drinkText}>🍺 {currentCard.drink_penalty}</Text>
        </View>
      </View>

      {/* Player Turn */}
      <Text style={playStyles.playerTurn}>{currentPlayer.name}'s Turn</Text>

      {showingChoice ? (
        /* Truth or Dare Choice */
        <View style={playStyles.choiceContainer}>
          <TouchableOpacity onPress={() => handleChoice('truth')} style={playStyles.choiceCard}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={playStyles.choiceGradient}>
              <Text style={playStyles.choiceEmoji}>🤔</Text>
              <Text style={playStyles.choiceText}>TRUTH</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleChoice('dare')} style={playStyles.choiceCard}>
            <LinearGradient colors={['#f093fb', '#f5576c']} style={playStyles.choiceGradient}>
              <Text style={playStyles.choiceEmoji}>😈</Text>
              <Text style={playStyles.choiceText}>DARE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        /* Card Display */
        <Animated.View style={[playStyles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={
              currentCard.card_subtype === 'truth' ? ['#667eea', '#764ba2'] : ['#f093fb', '#f5576c']
            }
            style={playStyles.card}
          >
            <Text style={playStyles.cardType}>
              {currentCard.card_subtype === 'truth' ? '🤔 TRUTH' : '😈 DARE'}
            </Text>
            <Text style={playStyles.cardContent}>{currentCard.content}</Text>
            <Text style={playStyles.cardPenalty}>
              Refuse = {currentCard.drink_penalty} {currentCard.drink_penalty === 1 ? 'sip' : 'sips'} 🍺
            </Text>
          </LinearGradient>
        </Animated.View>
      )}

      {!showingChoice && (
        <TouchableOpacity style={playStyles.nextBtn} onPress={handleNext}>
          <Text style={playStyles.nextText}>Next →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Main component
export default function TruthOrDareScreen() {
  const { session, startGame, isLoading } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);

  const handleStart = async (players: Player[], intensity: Intensity) => {
    try {
      await startGame('truth_or_dare', players, intensity);
      setGameStarted(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load game. Using offline mode.');
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_THEME.colors.background }}>
        <Text style={{ color: '#FFF', fontSize: 24 }}>🎭 Loading...</Text>
        <Text style={{ color: APP_THEME.colors.textSecondary, marginTop: 8 }}>
          Preparing your game
        </Text>
      </View>
    );
  }

  return gameStarted && session ? <GamePlay /> : <PlayerSetup onStart={handleStart} />;
}

// Styles
const setupStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.colors.background,
    padding: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: APP_THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  input: {
    backgroundColor: APP_THEME.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  },
  addText: {
    color: APP_THEME.colors.secondary,
    fontWeight: '600',
  },
  removeBtn: {
    padding: 12,
  },
  removeText: {
    color: APP_THEME.colors.primary,
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
    borderRadius: 16,
  },
  startText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
});

const playStyles = StyleSheet.create({
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
    marginBottom: 24,
  },
  closeBtn: {
    fontSize: 24,
    color: '#FFF',
    padding: 8,
  },
  counter: {
    color: APP_THEME.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  drinkBadge: {
    backgroundColor: APP_THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  drinkText: {
    color: '#FFF',
    fontWeight: '600',
  },
  playerTurn: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  choiceContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  choiceCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  choiceGradient: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 24,
  },
  choiceEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  choiceText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  cardContent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 34,
  },
  cardPenalty: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 24,
  },
  nextBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
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
  endSubtitle: {
    fontSize: 16,
    color: APP_THEME.colors.textSecondary,
    marginTop: 8,
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
});
