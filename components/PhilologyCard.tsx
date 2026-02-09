import { useState, useMemo, useCallback, memo } from 'react';
import { Dimensions, View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import WordChip, { Token, AncientContext } from './WordChip';
import { AudioPlayer } from '../src/services/AudioPlayer';
import OmegaLoader from './OmegaLoader';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

interface PhilologyCardProps {
  sentence: string;
  tokens?: Token[];
  translation: string;
  onTokenPress: (token: Token) => void;
  selectedToken?: Token | null;
}

function PhilologyCard({
  sentence,
  tokens,
  translation,
  onTokenPress,
  selectedToken
}: PhilologyCardProps) {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Use provided tokens or fallback to splitting the sentence
  const displayTokens = useMemo(() => {
    if (tokens && tokens.length > 0) return tokens;
    // Fallback: create dummy tokens from sentence
    return sentence.split(/\s+/).map((text) => ({
        text,
        lemma: text, // Fallback
        pos: 'UNKNOWN',
        // minimal Token shape
    } as Token));
  }, [tokens, sentence]);

  const handleSpeakSentence = async () => {
    if (isLoadingAudio || !sentence) return;
    setIsLoadingAudio(true);
    try {
      await AudioPlayer.playSentence(sentence);
    } catch (e) {
      console.error("Failed to play audio", e);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleLongPress = useCallback(async (token: Token) => {
      try {
          await AudioPlayer.playSentence(token.text);
      } catch (e) {
          console.error("Failed to play word audio", e);
      }
  }, []);

  return (
    <View
      className="bg-card rounded-3xl p-6 shadow-lg border border-gray-700 self-center mt-12 absolute top-0 z-50"
      style={{ width: CARD_WIDTH, backgroundColor: '#1a1918' }}
    >
      <View className="flex-row justify-between mb-4">
        <Text className="text-xs font-bold tracking-widest text-accent uppercase">Active Node</Text>
         <View className="h-6 w-6 justify-center items-center">
            {isLoadingAudio ? (
              <OmegaLoader size={20} color="#C0A062" />
            ) : (
              <IconButton
                icon="volume-high"
                size={20}
                iconColor="#C0A062"
                onPress={handleSpeakSentence}
                style={{ margin: 0 }}
              />
            )}
          </View>
      </View>

      <View className="flex-row flex-wrap items-end justify-center mb-6">
          {displayTokens.map((token, idx) => {
             // Check strict equality or fallback to text matching if tokens are regenerated
             const isFocused = selectedToken ? (selectedToken === token || selectedToken.text === token.text) : false;

             return (
                <WordChip
                  key={`${token.text}-${idx}`}
                  token={token}
                  onPress={onTokenPress}
                  onLongPress={handleLongPress}
                  isFocused={isFocused}
                />
             );
          })}
      </View>

      <View className="pt-4 border-t border-gray-800">
        <Text className="text-sm text-gray-400 font-serif italic text-center leading-5">
            {translation}
        </Text>
      </View>
    </View>
  );
}

export default memo(PhilologyCard);
