import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Platform,
  KeyboardAvoidingView, Alert, ActivityIndicator,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';

export function AuthScreen() {
  const { signInWithApple, signInWithEmail, signUpWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const handleAppleSignIn = async () => {
    try {
      const nonce = Math.random().toString(36).substring(2, 15);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (credential.identityToken) {
        await signInWithApple(credential.identityToken, nonce);
      }
    } catch (error: any) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error', 'Apple Sign In failed. Please try again.');
      }
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        Alert.alert('Check Email', 'Confirm your email to complete sign up.');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo & Branding */}
        <View style={styles.brandSection}>
          <Text style={styles.logoEmoji}>📊</Text>
          <Text style={styles.appName}>VentureStack</Text>
          <Text style={styles.tagline}>
            See which ventures actually make money.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {['P&L per venture', 'True $/hour', 'Quarterly tax estimates', 'AI Kill/Scale scorecard'].map(
            (f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            )
          )}
        </View>

        {/* Auth Buttons */}
        <View style={styles.authSection}>
          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          {!showEmail ? (
            <TouchableOpacity
              style={styles.emailToggle}
              onPress={() => setShowEmail(true)}
            >
              <Text style={styles.emailToggleText}>Continue with email</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emailForm}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.emailButton}
                onPress={handleEmailAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textInverse} />
                ) : (
                  <Text style={styles.emailButtonText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.switchText}>
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxxl,
  },
  logoEmoji: {
    fontSize: 56,
    marginBottom: theme.spacing.lg,
  },
  appName: {
    fontSize: theme.fontSize.hero,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  features: {
    marginBottom: theme.spacing.xxxxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureCheck: {
    fontSize: theme.fontSize.md,
    color: theme.colors.income,
    fontWeight: theme.fontWeight.bold,
    marginRight: theme.spacing.md,
  },
  featureText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  authSection: {
    gap: theme.spacing.md,
  },
  appleButton: {
    height: 52,
    width: '100%',
  },
  emailToggle: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  emailToggleText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  emailForm: {
    gap: theme.spacing.md,
  },
  input: {
    height: 52,
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emailButton: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  switchText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
