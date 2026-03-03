import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { APP_THEME } from '../../constants/themes';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.8;

interface SpinWheelProps {
  players: string[];
  onSpinComplete: (winner: string) => void;
}

export default function SpinWheel({ players, onSpinComplete }: SpinWheelProps) {
  const rotation = useSharedValue(0);
  const [spinning, setSpinning] = React.useState(false);
  const [winner, setWinner] = React.useState<string | null>(null);

  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#667eea', '#43e97b', '#f093fb', '#764ba2', '#FF8E53'];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);
    setWinner(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Random winner index
    const winnerIndex = Math.floor(Math.random() * players.length);
    const degreesPerSegment = 360 / players.length;
    const winnerDegree = winnerIndex * degreesPerSegment;
    const randomSpin = 360 * (5 + Math.random() * 3); // 5-8 full rotations
    const targetRotation = randomSpin + (360 - winnerDegree) + (degreesPerSegment / 2);

    rotation.value = withSequence(
      withTiming(targetRotation, {
        duration: 4000,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      })
    );

    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setWinner(players[winnerIndex]);
      setSpinning(false);
      onSpinComplete(players[winnerIndex]);
    }, 4000);
  };

  const segmentAngle = 360 / players.length;

  return (
    <View style={styles.container}>
      {/* Pointer */}
      <View style={styles.pointer}>
        <Text style={styles.pointerText}>▼</Text>
      </View>

      {/* Wheel */}
      <Animated.View style={[styles.wheel, animatedStyle]}>
        {players.map((player, index) => {
          const angle = (segmentAngle * index - 90) * (Math.PI / 180);
          const radius = WHEEL_SIZE / 3;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          return (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  backgroundColor: colors[index % colors.length],
                  transform: [
                    { rotate: `${segmentAngle * index}deg` },
                  ],
                },
              ]}
            >
              <View style={styles.segmentInner}>
                <Text
                  style={[
                    styles.playerName,
                    {
                      transform: [{ rotate: `${segmentAngle / 2}deg` }],
                    },
                  ]}
                  numberOfLines={1}
                >
                  {player}
                </Text>
              </View>
            </View>
          );
        })}
        <View style={styles.centerCircle}>
          <Text style={styles.centerEmoji}>🎯</Text>
        </View>
      </Animated.View>

      {/* Spin Button */}
      <TouchableOpacity
        style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
        onPress={handleSpin}
        disabled={spinning}
      >
        <Text style={styles.spinButtonText}>{spinning ? '🌀 Spinning...' : '✨ Spin!'}</Text>
      </TouchableOpacity>

      {/* Winner Display */}
      {winner && !spinning && (
        <View style={styles.winnerBanner}>
          <Text style={styles.winnerText}>🎉 {winner}'s Turn!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  pointer: {
    position: 'absolute',
    top: 20,
    zIndex: 10,
  },
  pointerText: {
    fontSize: 40,
    color: APP_THEME.colors.accent,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: APP_THEME.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  segment: {
    position: 'absolute',
    width: WHEEL_SIZE / 2,
    height: WHEEL_SIZE / 2,
    borderTopLeftRadius: WHEEL_SIZE / 2,
    borderTopRightRadius: WHEEL_SIZE / 2,
    transformOrigin: 'bottom center',
    opacity: 0.9,
  },
  segmentInner: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  playerName: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  centerCircle: {
    width: WHEEL_SIZE * 0.25,
    height: WHEEL_SIZE * 0.25,
    borderRadius: (WHEEL_SIZE * 0.25) / 2,
    backgroundColor: APP_THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: APP_THEME.colors.accent,
  },
  centerEmoji: {
    fontSize: 40,
  },
  spinButton: {
    marginTop: 40,
    backgroundColor: APP_THEME.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: APP_THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  spinButtonDisabled: {
    backgroundColor: APP_THEME.colors.textSecondary,
    opacity: 0.6,
  },
  spinButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  winnerBanner: {
    marginTop: 24,
    backgroundColor: APP_THEME.colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
  },
});
