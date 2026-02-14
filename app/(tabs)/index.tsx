import { BackdropBlur, Canvas, Fill, RoundedRect } from '@shopify/react-native-skia';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, LayoutChangeEvent, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
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
      // 1. The Handshake
      const response = await fetch(`${API_BASE_URL}/draft_curriculum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // We pass the controls from the Stele
        body: JSON.stringify({
          theme: theme,
          sentence_count: sentenceCount,
          target_level: cefLevel,
          complexity: complexity ? "complex" : "lucid"
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server Error: ${errText}`);
      }

      const graph = await response.json();

      // 2. The Validation (The Fix)
      // We check for 'nodes', NOT 'draft_data'
      if (graph && graph.nodes && graph.nodes.length > 0) {
        // 3. The Navigation
        // We pass the graph stringified to the next screen
        router.push({
          pathname: '/constellation',
          params: { graph: JSON.stringify(graph) }
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
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, zIndex: 10, elevation: 10 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center items-center px-6">

            {/* Title */}
            <Text className="text-4xl font-display text-text mb-8 text-center font-bold tracking-tight">
              Create a Curriculum
            </Text>

            <View className="w-full max-w-md">
              {/* Glass Input */}
              <View
                className="w-full mb-8 h-[64px] rounded-xl overflow-hidden relative"
                style={Platform.OS === 'web' ? { borderWidth: 1, borderColor: '#C5A059', backgroundColor: 'rgba(255,255,255,0.05)' } : undefined}
                onLayout={onInputLayout}
              >
                {Platform.OS !== 'web' && inputLayout.width > 0 && (
                  <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                    <BackdropBlur blur={10} clip={{ x: 0, y: 0, width: inputLayout.width, height: inputLayout.height, rx: 12, ry: 12 }}>
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
                  placeholderTextColor="rgba(227, 220, 203, 0.5)"
                  value={theme}
                  onChangeText={setTheme}
                  className="flex-1 px-4 text-text text-lg font-ui"
                  style={{ fontFamily: 'NeueHaasGrotesk-Text', zIndex: 50 }}
                  pointerEvents="auto"
                  autoCapitalize="sentences"
                  returnKeyType="done"
                  onSubmitEditing={handleWeave}
                />
              </View>

              {/* Stele of Command (Weaver Controls) */}
              <WeaverControls
                sentenceCount={sentenceCount}
                setSentenceCount={setSentenceCount}
                cefLevel={cefLevel}
                setCefLevel={setCefLevel}
                complexity={complexity}
                setComplexity={setComplexity}
              />


              {/* Aether Glass Button */}
              <AetherButton
                label="Weave Curriculum"
                onPress={handleWeave}
                disabled={isLoading || !theme.trim()}
              />

              {isLoading && (
                <View className="mt-8 items-center">
                  <OmegaLoader size={48} color="#C0A062" />
                  <Text className="text-accent mt-4 font-ui italic">
                    Weaving the threads of knowledge...
                  </Text>
                </View>
              )}

              {error && (
                <Text className="text-red-500 mt-4 text-center font-ui">
                  {error}
                </Text>
              )}
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
