import { useState, useMemo } from 'react';
import { Dimensions, View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import WordChip, { Token, AncientContext } from './WordChip';
import OmegaLoader from './OmegaLoader';
import { AudioPlayer } from '../src/services/AudioPlayer';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface PhilologyCardProps {
  modernGreek: string;
  targetTokens?: Token[];
  ancientContext: string | AncientContext;
  englishTranslation: string;
  knot: string;
  knotContext?: string;
  index: number;
  total: number;
  onTokenPress?: (token: Token, greek: string, english: string) => void;
  selectedToken?: Token | null;
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
  onTokenPress,
  selectedToken
}: PhilologyCardProps) {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Enrich tokens with knot information if missing
  const enrichedTokens = useMemo(() => {
    return targetTokens?.map(t => ({
      ...t,
      knot_definition: t.knot_definition || knot,
      knot_context: t.knot_context || knotContext
    })) || [];
  }, [targetTokens, knot, knotContext]);

  // Unified Interaction: Tap to Inspect
  const handleWordPress = (token: Token) => {
     if (onTokenPress) {
        onTokenPress(token, modernGreek, englishTranslation);
     }
  };

  // Unified Interaction: Long Press to Speak Word
  const handleLongPress = async (token: Token) => {
    try {
        await AudioPlayer.playSentence(token.text);
    } catch (e) {
        console.error("Failed to play word audio", e);
    }
  };

  const handleSpeakSentence = async () => {
    if (isLoadingAudio || modernGreek === "Generating..." || !modernGreek) return;
    setIsLoadingAudio(true);
    try {
      await AudioPlayer.playSentence(modernGreek);
    } catch (e) {
      console.error("Failed to play audio", e);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <View
      className="bg-card rounded-3xl p-6 mr-4 shadow-sm border border-gray-700"
      style={{ width: CARD_WIDTH, height: 500 }}
    >
      <View className="flex-row justify-between mb-2">
        <Text className="text-xs font-bold tracking-widest text-gray-500 uppercase">Knot</Text>
        <Text className="text-xs text-gray-500">{index + 1} / {total}</Text>
      </View>

      <View className="mb-8">
        <Text className="text-xl font-bold text-text leading-7 text-center italic">
          {knotContext || knot}
        </Text>
      </View>

      <View className="flex-1 justify-center">
        <View className="flex-row flex-wrap items-end">
          {enrichedTokens.length > 0 ? (
            enrichedTokens.map((token, idx) => {
               // Focused if it matches selectedToken (regardless of mode, since mode is unified)
               // Note: Comparison might fail if selectedToken is the ORIGINAL token object.
               // We should check by unique properties (like text + index maybe?)
               // But usually strict equality is used.
               // If selectedToken comes from a previous click on an enriched token, it will match.
               // If selectedToken comes from somewhere else, it might not.
               // Assuming handleWordPress passes the enriched token back up, then selectedToken WILL be one of these enriched tokens.
               const isFocused = selectedToken === token;

               return (
                  <WordChip
                    key={`${token.text}-${idx}`}
                    token={token}
                    onPress={handleWordPress}
                    onLongPress={handleLongPress}
                    isFocused={isFocused}
                  />
               );
            })
          ) : (
            <Text className="text-2xl font-bold text-text leading-9">{modernGreek}</Text>
          )}

          <View className="ml-2 mb-1 h-8 w-8 justify-center items-center">
            {isLoadingAudio ? (
              <OmegaLoader size={24} color="#C0A062" />
            ) : (
              <IconButton
                icon="volume-high"
                size={20}
                iconColor="#C0A062"
                onPress={handleSpeakSentence}
                style={{ margin: 0 }}
                disabled={modernGreek === "Generating..." || !modernGreek}
              />
            )}
          </View>
        </View>
      </View>

      <View className="mt-8 pt-4 border-t border-gray-800">
        <Text className="text-base text-text">{englishTranslation}</Text>
      </View>
    </View>
  );
}
