import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import WordChip, { Token } from './WordChip';
import { AudioPlayer } from '../src/services/AudioPlayer';
import OmegaLoader from './OmegaLoader';
import { Knot } from '../src/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

interface PhilologyCardProps {
  sentence: string;
  tokens?: Token[];
  knots?: Knot[];
  translation: string;
  onTokenPress?: (token: Token) => void;
  selectedToken?: Token | null;
}

// ── The Highlight: KnotWord ──────────────────────────────────────────────────
function KnotWord({ token, onPress, onLongPress, isFocused }: {
  token: Token;
  onPress: (token: Token) => void;
  onLongPress: (token: Token) => void;
  isFocused: boolean
}) {
  const pulse = useSharedValue(0.3);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite
      true // reverse
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderBottomColor: `rgba(197, 160, 89, ${pulse.value})`, // Byzantine Gold #C5A059 with opacity
    borderBottomWidth: 2,
    borderStyle: 'solid',
  }));

  return (
    <Animated.View style={animatedStyle}>
      <WordChip
        token={token}
        onPress={onPress}
        onLongPress={onLongPress}
        isFocused={isFocused}
      />
    </Animated.View>
  );
}

function PhilologyCard({
  sentence,
  tokens,
  knots,
  translation,
  onTokenPress,
  selectedToken
}: PhilologyCardProps) {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const displayTokens = useMemo(() => {
    if (tokens && tokens.length > 0) return tokens;
    return sentence.split(/\s+/).map((text) => ({
      text,
      lemma: text,
      pos: 'UNKNOWN',
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

  const handlePress = useCallback((token: Token) => {
    if (onTokenPress) {
      onTokenPress(token);
    }
  }, [onTokenPress]);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Active Node</Text>
        <View style={styles.audioButton}>
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

      {/* Token Display */}
      <View style={styles.tokenRow}>
        {displayTokens.map((token, idx) => {
          const isFocused = selectedToken
            ? (selectedToken === token || selectedToken.text === token.text)
            : false;

          const isKnot = knots?.some(k => k.text === token.text);

          if (isKnot) {
            return (
              <KnotWord
                key={`${token.text}-${idx}`}
                token={token}
                onPress={handlePress}
                onLongPress={handleLongPress}
                isFocused={isFocused}
              />
            );
          }

          return (
            <WordChip
              key={`${token.text}-${idx}`}
              token={token}
              onPress={handlePress}
              onLongPress={handleLongPress}
              isFocused={isFocused}
            />
          );
        })}
      </View>

      {/* Translation */}
      <View style={styles.translationContainer}>
        <Text style={styles.translationText}>{translation}</Text>
      </View>
    </View>
  );
}

export default memo(PhilologyCard);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1a1918',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 1)',
    alignSelf: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#C0A062',
    textTransform: 'uppercase',
    fontFamily: 'NeueHaasGrotesk',
  },
  audioButton: {
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 24,
  },
  translationContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 1)',
  },
  translationText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'NeueHaasGrotesk',
  },
});
