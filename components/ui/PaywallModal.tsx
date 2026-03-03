import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_THEME } from '../../constants/themes';
import { purchaseService, formatOffering, calculateSavings } from '../../lib/purchases';
import { PurchasesOffering } from 'react-native-purchases';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'annual') => void;
}

export default function PaywallModal({ visible, onClose, onSubscribe }: PaywallProps) {
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offering = await purchaseService.getOfferings();
      setOfferings(offering);
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Could not load subscription options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan: 'monthly' | 'annual') => {
    if (!offerings) {
      Alert.alert('Error', 'No offerings available');
      return;
    }

    const { monthly, annual } = formatOffering(offerings);
    const selectedPackage = plan === 'monthly' ? monthly : annual;

    if (!selectedPackage) {
      Alert.alert('Error', 'This plan is not available');
      return;
    }

    setPurchasing(true);

    try {
      const pkg = offerings.availablePackages.find(
        (p) => p.identifier === selectedPackage.identifier
      );

      if (!pkg) {
        throw new Error('Package not found');
      }

      const customerInfo = await purchaseService.purchasePackage(pkg);
      
      // Check if purchase was successful
      if (customerInfo.entitlements.active['pro']) {
        onSubscribe(plan);
        onClose();
        Alert.alert('🎉 Welcome to Pro!', 'Unlimited cards unlocked. Enjoy the party!');
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Failed', 'Could not complete purchase. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const { monthly, annual } = offerings ? formatOffering(offerings) : { monthly: null, annual: null };
  const savings = monthly && annual 
    ? calculateSavings(
        parseFloat(monthly.product.price_string.replace(/[^0-9.]/g, '')),
        parseFloat(annual.product.price_string.replace(/[^0-9.]/g, ''))
      )
    : 44;

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

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={APP_THEME.colors.primary} />
              <Text style={styles.loadingText}>Loading plans...</Text>
            </View>
          ) : (
            <>
              {annual && (
                <TouchableOpacity 
                  onPress={() => handlePurchase('annual')} 
                  style={styles.annualBtn}
                  disabled={purchasing}
                >
                  <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.annualGradient}>
                    <Text style={styles.annualPrice}>{annual.product.price_string}/year</Text>
                    <Text style={styles.annualSave}>Save {savings}% — Best Value</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {monthly && (
                <TouchableOpacity 
                  onPress={() => handlePurchase('monthly')} 
                  style={styles.monthlyBtn}
                  disabled={purchasing}
                >
                  <Text style={styles.monthlyText}>{monthly.product.price_string}/month</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={purchasing}>
            <Text style={styles.closeText}>Maybe Later</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>Cancel anytime. Auto-renews until cancelled.</Text>
          
          {purchasing && (
            <View style={styles.purchasingOverlay}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={styles.purchasingText}>Processing...</Text>
            </View>
          )}
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: APP_THEME.colors.textSecondary,
    marginTop: 12,
  },
  purchasingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  purchasingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 12,
  },
});
