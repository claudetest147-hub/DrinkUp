import React, { useState, useRef } from 'react';
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

const { width } = Dimensions.get('window');

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
      .map((name, i) => ({ id: String(i), name: name.trim(), score: 0, drinks: 0 }));

    if (validPlayers.length < 2) {
      Alert.alert('Need Players', 'Add at least 2 player names to start!');
      return;
    }
    onStart(validPlayers, intensity);
  };

  return (
    <View style={setupStyles.container}>
      <Text style={setupStyles.title}>⚡ Would You Rather</Text>
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
            style={[setupStyles.intensityBtn, intensity === level && setupStyles.intensityActive]}
            onPress={() => setIntensity(level)}
          >
            <Text style={setupStyles.intensityEmoji}>
              {level === 'mild' ? '😊' : level === 'spicy' ? '🌶️' : '🔥'}
            </Text>
            <Text style={[setupStyles.intensityLabel, intensity === level && { color: '#FFF' }]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={setupStyles.startBtn} onPress={handleStart}>
        <LinearGradient colors={['#4facfe', '#00f2fe']} style={setupStyles.startGradient}>
          <Text style={setupStyles.startText}>⚡ Start Game</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function GamePlay() {
  const { session, nextCard, endGame } = useGameStore();
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);
  const scaleA = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;

  if (!session) return null;

  const currentCard = session.cards[session.currentCardIndex];

  if (!currentCard) {
    return (
      <View style={styles.endContainer}>
        <Text style={styles.endEmoji}>⚡</Text>
        <Text style={styles.endTitle}>All Done!</Text>
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

  const handleSelect = (choice: 'a' | 'b') => {
    if (selected) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSelected(choice);
    
    const anim = choice === 'a' ? scaleA : scaleB;
    Animated.sequence([
      Animated.spring(anim, { toValue: 1.05, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleNext = () => {
    setSelected(null);
    nextCard();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { endGame(); router.back(); }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚡ Would You Rather</Text>
        <Text style={styles.counter}>
          {session.currentCardIndex + 1}/{session.cards.length}
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <Animated.View style={{ transform: [{ scale: scaleA }], flex: 1 }}>
          <TouchableOpacity
            onPress={() => handleSelect('a')}
            disabled={!!selected}
            style={[styles.optionCard, selected === 'a' && styles.selectedCard]}
          >
            <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.optionGradient}>
              <Text style={styles.optionLabel}>A</Text>
              <Text style={styles.optionText}>{currentCard.option_a || 'Option A'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <Animated.View style={{ transform: [{ scale: scaleB }], flex: 1 }}>
          <TouchableOpacity
            onPress={() => handleSelect('b')}
            disabled={!!selected}
            style={[styles.optionCard, selected === 'b' && styles.selectedCard]}
          >
            <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.optionGradient}>
              <Text style={styles.optionLabel}>B</Text>
              <Text style={styles.optionText}>{currentCard.option_b || 'Option B'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Text style={styles.penalty}>Minority drinks {currentCard.drink_penalty} 🍺</Text>

      {selected && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>Next Question →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function WouldYouRatherScreen() {
  const { session, startGame, isLoading } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);

  const handleStart = async (players: Player[], intensity: Intensity) => {
    try {
      await startGame('would_you_rather', players, intensity);
      setGameStarted(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load game. Using offline mode.');
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_THEME.colors.background }}>
        <Text style={{ color: '#FFF', fontSize: 24 }}>⚡ Loading...</Text>
      </View>
    );
  }

  return gameStarted && session ? <GamePlay /> : <PlayerSetup onStart={handleStart} />;
}

const setupStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_THEME.colors.background, padding: 24, paddingTop: 80 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 16, color: APP_THEME.colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 32 },
  input: { backgroundColor: APP_THEME.colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, color: '#FFF', fontSize: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginVertical: 16 },
  addBtn: { backgroundColor: APP_THEME.colors.surface, padding: 12, borderRadius: 12 },
  addText: { color: APP_THEME.colors.secondary, fontWeight: '600' },
  removeBtn: { padding: 12 },
  removeText: { color: APP_THEME.colors.primary },
  intensityTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginTop: 24, marginBottom: 12 },
  intensityRow: { flexDirection: 'row', gap: 12 },
  intensityBtn: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: APP_THEME.colors.surface },
  intensityActive: { backgroundColor: APP_THEME.colors.primary },
  intensityEmoji: { fontSize: 24, marginBottom: 4 },
  intensityLabel: { color: APP_THEME.colors.textSecondary, fontWeight: '600', fontSize: 13 },
  startBtn: { marginTop: 32, borderRadius: 16, overflow: 'hidden' },
  startGradient: { padding: 18, alignItems: 'center', borderRadius: 16 },
  startText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_THEME.colors.background, padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  closeBtn: { fontSize: 24, color: '#FFF', padding: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  counter: { color: APP_THEME.colors.textSecondary, fontWeight: '600' },
  cardsContainer: { flex: 1, justifyContent: 'center', gap: 16 },
  optionCard: { borderRadius: 24, overflow: 'hidden' },
  selectedCard: { borderWidth: 3, borderColor: APP_THEME.colors.accent },
  optionGradient: { padding: 32, borderRadius: 24, alignItems: 'center', minHeight: 180, justifyContent: 'center' },
  optionLabel: { fontSize: 14, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 12 },
  optionText: { fontSize: 20, fontWeight: '700', color: '#FFF', textAlign: 'center', lineHeight: 28 },
  vsContainer: { alignItems: 'center' },
  vsText: { fontSize: 20, fontWeight: '900', color: APP_THEME.colors.accent },
  penalty: { textAlign: 'center', color: APP_THEME.colors.textSecondary, marginTop: 16, fontSize: 14 },
  nextBtn: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20, marginBottom: 20 },
  nextText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  endContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_THEME.colors.background },
  endEmoji: { fontSize: 64, marginBottom: 16 },
  endTitle: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  endBtn: { marginTop: 32, backgroundColor: APP_THEME.colors.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  endBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
