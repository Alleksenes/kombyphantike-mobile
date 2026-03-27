// ── THE GATE OF THE SCRIPTORIUM ──────────────────────────────────────────────
// Byzantine-themed login screen. Two paths: Google OAuth or Guest (Initiate).

import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../src/store/authStore';

// ── Design Tokens ────────────────────────────────────────────────────────────
const GOLD = '#C5A059';
const GOLD_DIM = 'rgba(197, 160, 89, 0.15)';
const PARCHMENT = '#E3DCCB';
const GRAY_TEXT = '#9CA3AF';
const SURFACE = 'rgba(15, 5, 24, 0.6)';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, continueAsGuest, devBypass } = useAuthStore();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDevMode = process.env.EXPO_PUBLIC_DEV_MODE === 'true';

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e?.message ?? 'Authentication failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGuestEntry = () => {
    if (isDevMode) {
      devBypass();
    } else {
      continueAsGuest();
    }
    // Auth guard in _layout will redirect to (tabs)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ── The Crest ─────────────────────────────────────────────────── */}
        <View style={styles.crestContainer}>
          <View style={styles.crestRing}>
            <Text style={styles.crestSymbol}>Ω</Text>
          </View>
        </View>

        {/* ── Title Block ───────────────────────────────────────────────── */}
        <View style={styles.titleBlock}>
          <Text style={styles.appTitle}>Kombyphantike</Text>
          <View style={styles.titleDivider} />
          <Text style={styles.appSubtitle}>
            The Byzantine Scriptorium
          </Text>
          <Text style={styles.appTagline}>
            Where Modern Greek meets its Ancient roots
          </Text>
        </View>

        {/* ── Action Panel (Frosted Glass) ──────────────────────────────── */}
        <View style={styles.actionPanel}>
          {Platform.OS !== 'web' ? (
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={styles.actionPanelOverlay} />

          <View style={styles.actionContent}>
            {/* Google Sign In */}
            <Pressable
              onPress={handleGoogleSignIn}
              disabled={isSigningIn}
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.buttonPressed,
                isSigningIn && styles.buttonDisabled,
              ]}
            >
              {isSigningIn ? (
                <ActivityIndicator size="small" color="#1a1918" />
              ) : (
                <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.orDivider}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>

            {/* Guest Entry */}
            <Pressable
              onPress={handleGuestEntry}
              style={({ pressed }) => [
                styles.guestButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.guestButtonText}>Continue as Initiate</Text>
              <Text style={styles.guestSubtext}>Free tier · A1–A2 islands</Text>
            </Pressable>

            {/* Error */}
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* DEV BYPASS — visible only when EXPO_PUBLIC_DEV_MODE=true */}
            {isDevMode && (
              <>
                <View style={styles.orDivider}>
                  <View style={styles.orLine} />
                  <Text style={[styles.orText, { color: '#EF4444' }]}>dev</Text>
                  <View style={styles.orLine} />
                </View>
                <Pressable
                  onPress={devBypass}
                  style={({ pressed }) => [styles.devButton, pressed && styles.buttonPressed]}
                >
                  <Text style={styles.devButtonText}>DEV BYPASS</Text>
                  <Text style={styles.devButtonSub}>Scholar · No auth required</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <Text style={styles.footerText}>
          Scholars unlock the full philological depth{'\n'}
          LSJ Citations · B1+ Islands · Diachronic Analysis
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  // ── Crest ─────────────────────────────────────────────────────────────────
  crestContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  crestRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: GOLD,
    backgroundColor: GOLD_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestSymbol: {
    fontFamily: 'GFSDidot',
    fontSize: 48,
    color: GOLD,
  },

  // ── Title Block ───────────────────────────────────────────────────────────
  titleBlock: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appTitle: {
    fontFamily: 'GFSDidot',
    fontSize: 36,
    color: PARCHMENT,
    letterSpacing: 1,
    textAlign: 'center',
  },
  titleDivider: {
    width: 60,
    height: 1,
    backgroundColor: GOLD,
    marginVertical: 12,
  },
  appSubtitle: {
    fontFamily: 'GFSDidot',
    fontSize: 16,
    color: GOLD,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 13,
    color: GRAY_TEXT,
    textAlign: 'center',
    marginTop: 8,
  },

  // ── Action Panel ──────────────────────────────────────────────────────────
  actionPanel: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.2)',
    overflow: 'hidden',
    marginBottom: 32,
  },
  actionPanelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SURFACE,
  },
  actionContent: {
    padding: 28,
    gap: 16,
  },

  // ── Google Button ─────────────────────────────────────────────────────────
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
  },
  googleIcon: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1918',
  },
  googleButtonText: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1918',
    letterSpacing: 0.3,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // ── Or Divider ────────────────────────────────────────────────────────────
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
  },
  orText: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 12,
    color: GRAY_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Guest Button ──────────────────────────────────────────────────────────
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(197, 160, 89, 0.06)',
  },
  guestButtonText: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 15,
    color: PARCHMENT,
    letterSpacing: 0.3,
  },
  guestSubtext: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 11,
    color: GRAY_TEXT,
    marginTop: 4,
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  errorText: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
  },

  // ── Dev Bypass ────────────────────────────────────────────────────────────
  devButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
  devButtonText: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 13,
    color: '#EF4444',
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  devButtonSub: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 10,
    color: 'rgba(239, 68, 68, 0.6)',
    marginTop: 2,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footerText: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 11,
    color: 'rgba(156, 163, 175, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
