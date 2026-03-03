import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { APP_THEME } from '../../constants/themes';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

export default function AuthScreen() {
  const { signIn } = useAuthStore();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinueAsGuest = async () => {
    try {
      // Sign in anonymously
      const { error } = await supabase.auth.signInAnonymously();
      
      if (error) throw error;
      
      // Navigate to home as guest
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Guest signin error:', error);
      Alert.alert('Error', 'Could not continue as guest. Please try again.');
    }
  };

  const handleAppleSignIn = async () => {
    Alert.alert('Coming Soon', 'Apple Sign In will be available in the next update!');
    // TODO: Implement Apple Sign In
    // import * as AppleAuthentication from 'expo-apple-authentication';
  };

  const handleGoogleSignIn = async () => {
    Alert.alert('Coming Soon', 'Google Sign In will be available in the next update!');
    // TODO: Implement Google Sign In
    // import * as Google from 'expo-auth-session/providers/google';
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        Alert.alert(
          'Check your email!',
          'We sent you a confirmation link to complete signup',
          [{ text: 'OK', onPress: () => setIsSignUp(false) }]
        );
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (showEmailForm) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowEmailForm(false)}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.logo}>🍻</Text>
            <Text style={styles.title}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Sign up to save your progress and stats'
                : 'Sign in to continue the party'}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={APP_THEME.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={APP_THEME.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryGradient}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.switchLink}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.logo}>🍻</Text>
        <Text style={styles.title}>DrinkUp</Text>
        <Text style={styles.subtitle}>Ready to Party?</Text>
      </View>

      <View style={styles.authOptions}>
        {/* Guest Mode - Highest Priority */}
        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleContinueAsGuest}
        >
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
          <Text style={styles.guestSubtext}>Try 1 game for free</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up to save progress</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Sign In */}
        <TouchableOpacity
          style={[styles.socialButton, styles.appleButton]}
          onPress={handleAppleSignIn}
        >
          <Text style={styles.socialIcon}>🍎</Text>
          <Text style={styles.socialButtonText}>Sign in with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton]}
          onPress={handleGoogleSignIn}
        >
          <Text style={styles.socialIcon}>G</Text>
          <Text style={styles.socialButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.emailButton]}
          onPress={() => setShowEmailForm(true)}
        >
          <Text style={styles.socialIcon}>✉️</Text>
          <Text style={styles.socialButtonText}>Continue with Email</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.legal}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 80,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: APP_THEME.colors.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
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
    textAlign: 'center',
  },
  authOptions: {
    gap: 12,
  },
  guestButton: {
    backgroundColor: APP_THEME.colors.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  guestButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  guestSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: APP_THEME.colors.surface,
  },
  dividerText: {
    fontSize: 12,
    color: APP_THEME.colors.textSecondary,
    marginHorizontal: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_THEME.colors.surface,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  googleButton: {
    backgroundColor: APP_THEME.colors.surface,
  },
  emailButton: {
    backgroundColor: APP_THEME.colors.surface,
  },
  socialIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: APP_THEME.colors.surface,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#FFF',
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  primaryGradient: {
    padding: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    fontSize: 14,
    color: APP_THEME.colors.textSecondary,
  },
  switchLink: {
    color: APP_THEME.colors.primary,
    fontWeight: '700',
  },
  legal: {
    fontSize: 12,
    color: APP_THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 18,
  },
});
