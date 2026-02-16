import { memo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';

export interface AncientContext {
  author: string;
  greek: string;
  translation: string;
}

export interface EtymologyJewel {
  author: string;
  greek: string;
  translation: string;
  citations: string[];
}

export interface Token {
  text: string;
  lemma: string;
  pos: string;
  tag?: string;
  dep?: string;
  is_alpha?: boolean;
  has_paradigm?: boolean;
  paradigm?: { form: string; tags: string[] }[];
  ancient_context?: string | AncientContext;
  etymology_json?: EtymologyJewel;
  definition?: string;
  transliteration?: string;
  morphology?: string;
  knot_definition?: string;
  knot_context?: string;
}

interface WordChipProps {
  token: Token;
  onPress: (token: Token) => void;
  onLongPress: (token: Token) => void;
  isFocused?: boolean;
}

function WordChip({ token, onPress, onLongPress, isFocused = false }: WordChipProps) {
  const isHeavy = ['NOUN', 'VERB', 'ADJ', 'PROPN'].includes(token.pos);
  const isPunctuation = token.pos === 'PUNCT';

  if (isPunctuation) {
    return (
      <Text style={styles.punctuation}>
        {token.text}
      </Text>
    );
  }

  return (
    <Pressable
      onPress={() => onPress(token)}
      onLongPress={() => onLongPress(token)}
      delayLongPress={500}
      style={[
        styles.chip,
        isFocused ? styles.chipFocused : styles.chipNormal,
        !isFocused && isHeavy && styles.chipHeavy,
      ]}
    >
      <View style={styles.chipContent}>
        <Text
          style={[
            styles.mainText,
            isFocused ? styles.mainTextFocused : styles.mainTextNormal,
          ]}
        >
          {token.text}
        </Text>
        {token.transliteration && (
          <Text
            style={[
              styles.subText,
              isFocused ? styles.subTextFocused : styles.subTextNormal,
            ]}
          >
            {token.transliteration}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default memo(WordChip);

const styles = StyleSheet.create({
  punctuation: {
    fontSize: 20,
    color: '#E3DCCB',
    fontFamily: 'GFSDidot',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  chip: {
    marginRight: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  chipFocused: {
    backgroundColor: '#C0A062',
    borderRadius: 8,
  },
  chipNormal: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  chipHeavy: {
    borderBottomColor: 'rgba(227, 220, 203, 0.2)',
  },
  chipContent: {
    alignItems: 'center',
  },
  mainText: {
    fontSize: 20,
    fontFamily: 'GFSDidot',
  },
  mainTextFocused: {
    color: '#1a1918',
  },
  mainTextNormal: {
    color: '#E3DCCB',
  },
  subText: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: -2,
    fontFamily: 'NeueHaasGrotesk-Text',
  },
  subTextFocused: {
    color: 'rgba(26, 25, 24, 0.6)',
  },
  subTextNormal: {
    color: '#6B7280',
  },
});
