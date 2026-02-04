import { useState, useEffect, useRef } from 'react';
import { Dimensions, Platform, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import WordChip, { Token } from './WordChip'; // <--- This works because they are neighbors

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface PhilologyCardProps {
  modernGreek: string;
  targetTokens?: Token[];
  ancientContext: string;
  englishTranslation: string;
  knot: string;
  knotContext?: string;
  index: number;
  total: number;
  onTokenPress?: (token: Token) => void;
}

export default function PhilologyCard({
  modernGreek,
  targetTokens,
  ancientContext,
  englishTranslation,
  knot,
  knotContext,
  index,
  total,
  onTokenPress
}: PhilologyCardProps) {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handleWordPress = (token: Token) => {
    console.log("Touched Token:", token);
    if (onTokenPress) {
      onTokenPress(token);
    }
  };

  const handleSpeak = async () => {
    if (isLoadingAudio) return;
    setIsLoadingAudio(true);
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: modernGreek }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio');
      }

      const data = await response.json();
      if (data.audio) {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/mp3;base64,${data.audio}` },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            soundRef.current = null;
          }
        });
      }
    } catch (e) {
      console.error("Audio playback failed", e);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <View
      className="bg-paper rounded-3xl p-6 mr-4 shadow-sm border border-gray-200 dark:border-gray-700"
      style={{ width: CARD_WIDTH, height: 500 }}
    >
      <View className="flex-row justify-between mb-2">
        <Text className="text-xs font-bold tracking-widest text-gray-400 uppercase">Knot</Text>
        <Text className="text-xs text-gray-400">{index + 1} / {total}</Text>
      </View>

      <View className="mb-8">
        <Text className="text-xl font-bold text-ink leading-7 text-center italic">
          {knotContext || knot}
        </Text>
      </View>

      {/* Ancient Context removed from here as per redesign */}

      <View className="flex-1 justify-center">
        <View className="flex-row flex-wrap items-end">
          {targetTokens && targetTokens.length > 0 ? (
            targetTokens.map((token, idx) => (
              <WordChip key={`${token.text}-${idx}`} token={token} onPress={handleWordPress} />
            ))
          ) : (
            <Text className="text-2xl font-bold text-ink leading-9">{modernGreek}</Text>
          )}

          <View className="ml-2 mb-1 h-8 w-8 justify-center items-center">
            {isLoadingAudio ? (
              <ActivityIndicator size={20} />
            ) : (
              <IconButton
                icon="volume-high"
                size={20}
                onPress={handleSpeak}
                style={{ margin: 0 }}
              />
            )}
          </View>
        </View>
      </View>

      <View className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Text className="text-base text-ink">{englishTranslation}</Text>
      </View>
    </View>
  );
}
