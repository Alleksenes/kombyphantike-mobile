import { BackdropBlur, Canvas, Fill, RoundedRect } from '@shopify/react-native-skia';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import OmegaLoader from '../../components/OmegaLoader';
import AetherButton from '../../components/ui/AetherButton';
import WeaverControls from '../../components/ui/WeaverControls';
import { API_BASE_URL } from '../../src/services/apiConfig';

export default function WeaverScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputLayout, setInputLayout] = useState({ width: 0, height: 0 });

  const [sentenceCount, setSentenceCount] = useState(10);
  const [cefLevel, setCefLevel] = useState('Any');
  const [complexity, setComplexity] = useState(false);

  const handleWeave = async () => {
    if (!theme.trim()) return;
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

            <Text style={styles.title}>Create a Curriculum</Text>

            <View style={styles.formContainer}>
              {/* ── Glass Input ─────────────────────────────────────── */}
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

              {/* ── Stele of Command ────────────────────────────────── */}
              <WeaverControls
                sentenceCount={sentenceCount}
                setSentenceCount={setSentenceCount}
                cefLevel={cefLevel}
                setCefLevel={setCefLevel}
                complexity={complexity}
                setComplexity={setComplexity}
              />

              {/* ── CTA Button ──────────────────────────────────────── */}
              <AetherButton
                label="Weave Curriculum"
                onPress={handleWeave}
                disabled={isLoading || !theme.trim()}
              />

              {isLoading && (
                <View style={styles.loaderBlock}>
                  <OmegaLoader size={48} color="#C0A062" />
                  <Text style={styles.loaderText}>Weaving the threads of knowledge...</Text>
                </View>
              )}

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </View>

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
  loaderBlock: {
    marginTop: 32,
    alignItems: 'center',
  },
  loaderText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 13,
    color: '#C0A062',
    fontStyle: 'italic',
    marginTop: 12,
  },
  errorText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 13,
    color: '#F87171',
    textAlign: 'center',
    marginTop: 16,
  },
});
