import { BackdropBlur, Canvas, Fill, RoundedRect } from '@shopify/react-native-skia';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import MonolithButton from '../../components/ui/MonolithButton';
import WeaverControls from '../../components/ui/WeaverControls';
import { API_BASE_URL } from '../../src/services/apiConfig';

// ─── Gold Ring Pulse ──────────────────────────────────────────────────────────
function TransmutationOverlay({ theme }: { theme: string }) {
  const ring1Scale = useSharedValue(0.4);
  const ring1Opacity = useSharedValue(0.9);
  const ring2Scale = useSharedValue(0.4);
  const ring2Opacity = useSharedValue(0.9);
  const ring3Scale = useSharedValue(0.4);
  const ring3Opacity = useSharedValue(0.9);

  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered ring pulses
    const dur = 2000;
    const easeOut = Easing.out(Easing.cubic);

    ring1Scale.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 0 }),
        withTiming(1.6, { duration: dur, easing: easeOut }),
      ),
      -1,
      false,
    );
    ring1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 0 }),
        withTiming(0, { duration: dur, easing: easeOut }),
      ),
      -1,
      false,
    );

    // Ring 2: delayed by 666ms
    setTimeout(() => {
      ring2Scale.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 0 }),
          withTiming(1.6, { duration: dur, easing: easeOut }),
        ),
        -1,
        false,
      );
      ring2Opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 0 }),
          withTiming(0, { duration: dur, easing: easeOut }),
        ),
        -1,
        false,
      );
    }, 666);

    // Ring 3: delayed by 1332ms
    setTimeout(() => {
      ring3Scale.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 0 }),
          withTiming(1.6, { duration: dur, easing: easeOut }),
        ),
        -1,
        false,
      );
      ring3Opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 0 }),
          withTiming(0, { duration: dur, easing: easeOut }),
        ),
        -1,
        false,
      );
    }, 1332);

    // Fade in text
    textOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }));
  const ring3Style = useAnimatedStyle(() => ({
    opacity: ring3Opacity.value,
    transform: [{ scale: ring3Scale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={overlay.container}>
      {/* Expanding rings */}
      <View style={overlay.ringContainer}>
        <Animated.View style={[overlay.ring, ring1Style]} />
        <Animated.View style={[overlay.ring, ring2Style]} />
        <Animated.View style={[overlay.ring, ring3Style]} />
        {/* Solid gold core dot */}
        <View style={overlay.core} />
      </View>

      {/* Transmuting text */}
      <Animated.View style={textStyle}>
        <Text style={overlay.label}>Transmuting</Text>
        <Text style={overlay.themeText} numberOfLines={2} adjustsFontSizeToFit>
          {theme || '…'}
        </Text>
      </Animated.View>
    </View>
  );
}

const overlay = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  ringContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: '#C5A059',
  },
  core: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C5A059',
  },
  label: {
    fontFamily: 'GFSDidot',
    fontSize: 14,
    color: 'rgba(197, 160, 89, 0.6)',
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  themeText: {
    fontFamily: 'GFSDidot',
    fontSize: 26,
    color: '#E3DCCB',
    textAlign: 'center',
    letterSpacing: -0.5,
    maxWidth: 280,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WeaverScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputLayout, setInputLayout] = useState({ width: 0, height: 0 });

  const [sentenceCount, setSentenceCount] = useState(10);
  const [cefLevel, setCefLevel] = useState('Any');
  const [complexity, setComplexity] = useState(false);

  // Reanimated shared values for form fade-out
  const formOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);

  useEffect(() => {
    if (isLoading) {
      formOpacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
      formTranslateY.value = withTiming(-20, { duration: 500, easing: Easing.out(Easing.cubic) });
    } else {
      formOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
      formTranslateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    }
  }, [isLoading]);

  const formAnimStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const handleWeave = async () => {
    if (!theme.trim()) return;
    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/draft_curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          sentence_count: sentenceCount,
          target_level: cefLevel,
          complexity: complexity ? 'complex' : 'lucid',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server Error: ${errText}`);
      }

      const graph = await response.json();

      if (graph && graph.nodes && graph.nodes.length > 0) {
        router.push({
          pathname: '/constellation',
          params: { graph: JSON.stringify(graph) },
        });
      } else {
        throw new Error('The Oracle returned an empty universe.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to weave curriculum.');
    } finally {
      setIsLoading(false);
    }
  };

  const onInputLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setInputLayout({ width, height });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>

            {/* ── Transmutation Overlay (shown while loading) ──────── */}
            {isLoading && <TransmutationOverlay theme={theme} />}

            {/* ── Form (fades out when loading) ───────────────────── */}
            <Animated.View
              style={[styles.formWrapper, formAnimStyle]}
              pointerEvents={isLoading ? 'none' : 'auto'}
            >
              <Text style={styles.title}>Create a Curriculum</Text>

              <View style={styles.formContainer}>
                {/* ── Glass Input ──────────────────────────────────── */}
                <View
                  style={[
                    styles.inputWrapper,
                    Platform.OS === 'web' && styles.inputWrapperWeb,
                  ]}
                  onLayout={onInputLayout}
                >
                  {Platform.OS !== 'web' && inputLayout.width > 0 && (
                    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                      <BackdropBlur
                        blur={10}
                        clip={{ x: 0, y: 0, width: inputLayout.width, height: inputLayout.height, rx: 12, ry: 12 }}
                      >
                        <Fill color="rgba(255,255,255,0.05)" />
                      </BackdropBlur>
                      <RoundedRect
                        x={0.5}
                        y={0.5}
                        width={inputLayout.width - 1}
                        height={inputLayout.height - 1}
                        r={12}
                        color="#C5A059"
                        style="stroke"
                        strokeWidth={1}
                      />
                    </Canvas>
                  )}
                  <TextInput
                    placeholder="Enter a Theme (e.g., 'Justice', 'The Sea')..."
                    placeholderTextColor="rgba(227, 220, 203, 0.4)"
                    value={theme}
                    onChangeText={setTheme}
                    style={styles.textInput}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                    onSubmitEditing={handleWeave}
                  />
                </View>

                {/* ── Stele of Command ─────────────────────────────── */}
                <WeaverControls
                  sentenceCount={sentenceCount}
                  setSentenceCount={setSentenceCount}
                  cefLevel={cefLevel}
                  setCefLevel={setCefLevel}
                  complexity={complexity}
                  setComplexity={setComplexity}
                />

                {/* ── CTA Button ───────────────────────────────────── */}
                <MonolithButton
                  label="Weave Curriculum"
                  onPress={handleWeave}
                  disabled={isLoading || !theme.trim()}
                />

                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
              </View>
            </Animated.View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  keyboardView: {
    flex: 1,
    zIndex: 10,
    elevation: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  formWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E3DCCB',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    maxWidth: 420,
  },
  inputWrapper: {
    width: '100%',
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  inputWrapperWeb: {
    borderWidth: 1,
    borderColor: '#C5A059',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    color: '#E3DCCB',
    fontSize: 16,
    fontFamily: 'NeueHaasGrotesk-Text',
    zIndex: 50,
    height: '100%',
  },
  errorText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 13,
    color: '#F87171',
    textAlign: 'center',
    marginTop: 16,
  },
});
