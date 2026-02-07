import { useState, useEffect, useMemo } from 'react';
import { Dimensions, View, Text } from 'react-native';
import { IconButton, ActivityIndicator } from 'react-native-paper';
import WordChip, { Token } from './WordChip';
import { AudioPlayer } from '../src/services/AudioPlayer';

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
  mode: 'read' | 'analyze' | 'drill';
  selectedToken?: Token | null;
}

function identifyHeroToken(tokens: Token[], knot: string): Token | null {
  if (!tokens || tokens.length === 0) return null;
  const lowerKnot = knot.toLowerCase();

  // 1. Try to find a token whose POS matches the knot start
  if (lowerKnot.includes('verb')) {
      const verb = tokens.find(t => t.pos === 'VERB');
      if (verb) return verb;
  }
  if (lowerKnot.includes('noun')) {
      const noun = tokens.find(t => t.pos === 'NOUN');
      if (noun) return noun;
  }

  // 2. Try to match morphology keywords
  const keywords = ['active', 'passive', 'present', 'aorist', 'future', 'imperfect', 'subjunctive', 'optative', 'imperative', 'indicative', 'nominative', 'genitive', 'dative', 'accusative', 'vocative'];

  let bestToken = null;
  let maxScore = -1;

  for (const token of tokens) {
      if (!['NOUN', 'VERB', 'ADJ', 'PROPN'].includes(token.pos)) continue;

      let score = 0;
      const morph = (token.morphology || "").toLowerCase();

      keywords.forEach(kw => {
          if (lowerKnot.includes(kw) && morph.includes(kw)) {
              score++;
          }
      });

      if (score > maxScore) {
          maxScore = score;
          bestToken = token;
      }
  }

  if (bestToken) return bestToken;

  // 3. Fallback: Longest heavy word
  const heavyTokens = tokens.filter(t => ['NOUN', 'VERB', 'ADJ', 'PROPN'].includes(t.pos));
  if (heavyTokens.length > 0) {
      return heavyTokens.reduce((a, b) => a.text.length > b.text.length ? a : b);
  }

  return null;
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
  mode,
  selectedToken
}: PhilologyCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  useEffect(() => {
      setRevealed(false);
  }, [mode, knot]);

  const heroToken = useMemo(() => {
      if (mode !== 'drill') return null;
      return identifyHeroToken(targetTokens || [], knot);
  }, [mode, targetTokens, knot]);

  const handleWordPress = (token: Token) => {
    if (mode === 'drill') {
        if (heroToken && token === heroToken) {
            setRevealed(true);
        }
        return;
    }

    if (mode === 'analyze') {
       if (onTokenPress) {
          onTokenPress(token);
       }
    }
  };

  const handleSpeak = async () => {
    if (isLoadingAudio) return;
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
          {targetTokens && targetTokens.length > 0 ? (
            targetTokens.map((token, idx) => {
               const isHero = heroToken === token;
               // Clozed if it is the hero, we are in drill mode, and it hasn't been revealed yet.
               const isClozed = mode === 'drill' && isHero && !revealed;
               // Focused if we are in analyze mode and it matches selectedToken
               const isFocused = mode === 'analyze' && selectedToken === token;

               return (
                  <WordChip
                    key={`${token.text}-${idx}`}
                    token={token}
                    onPress={handleWordPress}
                    isClozed={isClozed}
                    isFocused={isFocused}
                  />
               );
            })
          ) : (
            <Text className="text-2xl font-bold text-text leading-9">{modernGreek}</Text>
          )}

          <View className="ml-2 mb-1 h-8 w-8 justify-center items-center">
            {isLoadingAudio ? (
              <ActivityIndicator size={20} color="#C0A062" />
            ) : (
              <IconButton
                icon="volume-high"
                size={20}
                iconColor="#C0A062"
                onPress={handleSpeak}
                style={{ margin: 0 }}
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
