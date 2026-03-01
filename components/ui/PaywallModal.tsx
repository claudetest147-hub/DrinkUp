import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_THEME } from '../../constants/themes';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'annual') => void;
}

export default function PaywallModal({ visible, onClose, onSubscribe }: PaywallProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.emoji}>👑</Text>
          <Text style={styles.title}>Go Pro</Text>
          <Text style={styles.subtitle}>Unlock the full party experience</Text>

          <View style={styles.features}>
            {[
              '♾️ Unlimited cards per session',
              '🔥 Extreme intensity mode',
              '🎯 AI-personalized content',
              '📦 Exclusive daily packs',
              '🚫 No ads ever',
            ].map((feature, i) => (
              <Text key={i} style={styles.feature}>
                {feature}
              </Text>
            ))}
          </View>

          <TouchableOpacity onPress={() => onSubscribe('annual')} style={styles.annualBtn}>
            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.annualGradient}>
              <Text style={styles.annualPrice}>$39.99/year</Text>
              <Text style={styles.annualSave}>Save 44% — Best Value</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onSubscribe('monthly')} style={styles.monthlyBtn}>
            <Text style={styles.monthlyText}>$5.99/month</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Maybe Later</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>Cancel anytime. Billed through App Store.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    backgroundColor: APP_THEME.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: APP_THEME.colors.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },
  features: {
    width: '100%',
    marginBottom: 24,
  },
  feature: {
    fontSize: 16,
    color: '#FFF',
    paddingVertical: 8,
  },
  annualBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  annualGradient: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  annualPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  annualSave: {
    fontSize: 13,
    color: '#1A1A2E',
    marginTop: 2,
  },
  monthlyBtn: {
    width: '100%',
    padding: 18,
    borderRadius: 16,
    backgroundColor: APP_THEME.colors.surface,
    alignItems: 'center',
    marginBottom: 12,
  },
  monthlyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  closeBtn: {
    padding: 12,
  },
  closeText: {
    color: APP_THEME.colors.textSecondary,
    fontSize: 16,
  },
  legal: {
    fontSize: 11,
    color: APP_THEME.colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});
