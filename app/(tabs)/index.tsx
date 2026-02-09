import { BackdropBlur, Canvas, Fill, RoundedRect } from '@shopify/react-native-skia';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, LayoutChangeEvent, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import OmegaLoader from '../../components/OmegaLoader';
import CosmicBackground from '../../components/ui/CosmicBackground';
import MoltenButton from '../../components/ui/MoltenButton';
import WeaverControls from '../../components/ui/WeaverControls';
import { SessionStore } from '../../services/SessionStore';
import { API_BASE_URL } from '../../src/services/apiConfig';

export default function WeaverScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerLayout, setContainerLayout] = useState({ width: 0, height: 0 });

  const [sentenceCount, setSentenceCount] = useState(10);
  const [complexity, setComplexity] = useState(false);
  const [cefLevel, setCefLevel] = useState('Any');

  const handleWeave = async () => {
    if (!theme.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/draft_curriculum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: theme,
          sentence_count: sentenceCount,
          cef_level: cefLevel,
          complexity: complexity ? "complex" : "lucid",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response:", JSON.stringify(data, null, 2)); // DEBUG LOG

      // DATA MAPPING (DEFENSIVE CODING)
      // Ensure we map 'edges' to 'links' if the backend missed the memo
      const cleanData = {
        nodes: data.nodes || data.graph?.nodes || [],
        links: data.links || data.edges || data.graph?.links || data.graph?.edges || []
      };

      if (data.draft_data) {
        SessionStore.setDraft(data.draft_data, false);
      }
      SessionStore.setTheme(theme);
      SessionStore.setInstructions(theme);

      // Navigate passing the stringified CLEAN data
      router.push({
        pathname: '/constellation',
        params: { graph: JSON.stringify(cleanData) }
      });

    } catch (err) {
      console.error("Weave Error:", err);
      setError('The Threads are Tangled. Check your Conduit.');
    } finally {
      setIsLoading(false);
    }
  };

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerLayout({ width, height });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {/* 1. Cosmic Background */}
      <CosmicBackground />

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

              {/* Obsidian Glass Container */}
              <View
                className="w-full mb-8 rounded-[20px] overflow-hidden relative p-6"
                style={Platform.OS === 'web'
                  ? { borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.3)', backgroundColor: 'rgba(10, 5, 15, 0.85)' }
                  : undefined}
                onLayout={onContainerLayout}
              >
                {Platform.OS !== 'web' && containerLayout.width > 0 && (
                  <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                    <BackdropBlur blur={20} clip={{ x: 0, y: 0, width: containerLayout.width, height: containerLayout.height, rx: 20, ry: 20 }}>
                      <Fill color="rgba(10, 5, 15, 0.85)" />
                    </BackdropBlur>
                    <RoundedRect
                      x={0.5}
                      y={0.5}
                      width={containerLayout.width - 1}
                      height={containerLayout.height - 1}
                      r={20}
                      color="rgba(197, 160, 89, 0.3)"
                      style="stroke"
                      strokeWidth={1}
                    />
                  </Canvas>
                )}

                {/* Input Field (Underline Only) */}
                <TextInput
                  placeholder="Enter a Theme (e.g., 'Justice', 'The Sea')..."
                  placeholderTextColor="rgba(227, 220, 203, 0.5)"
                  value={theme}
                  onChangeText={setTheme}
                  className="w-full text-lg font-display mb-8"
                  style={{
                    fontFamily: 'NeueHaasGrotesk-Display',
                    color: '#E3DCCB',
                    borderBottomWidth: 1,
                    borderBottomColor: '#C5A059',
                    paddingBottom: 8,
                    backgroundColor: 'transparent',
                    zIndex: 50
                  }}
                  pointerEvents="auto"
                  autoCapitalize="sentences"
                  returnKeyType="done"
                  onSubmitEditing={handleWeave}
                />

                {/* Stele of Command (Weaver Controls) */}
                <WeaverControls
                  sentenceCount={sentenceCount}
                  setSentenceCount={setSentenceCount}
                  cefLevel={cefLevel}
                  setCefLevel={setCefLevel}
                  complexity={complexity}
                  setComplexity={setComplexity}
                />
              </View>

              {/* Molten Gold Button (Outside, Floating Below) */}
              <MoltenButton
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
