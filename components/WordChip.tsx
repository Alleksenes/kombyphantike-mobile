import { Pressable, Text, View } from 'react-native';

export interface Token {
  text: string;
  lemma: string;
  pos: string;
  tag?: string;
  dep?: string;
  is_alpha?: boolean;
  has_paradigm?: boolean;
  paradigm?: { form: string; tags: string[] }[];
  ancient_context?: string;
  definition?: string;
  transliteration?: string;
  morphology?: string;
}

interface WordChipProps {
  token: Token;
  onPress: (token: Token) => void;
}

export default function WordChip({ token, onPress }: WordChipProps) {
  // Logic: Is this a "heavy" word?
  const isHeavy = ['NOUN', 'VERB', 'ADJ', 'PROPN'].includes(token.pos);
  const isPunctuation = token.pos === 'PUNCT';

  if (isPunctuation) {
    return (
      <Text className="text-xl text-ink font-serif self-end mb-1">
        {token.text}
      </Text>
    );
  }

  return (
    <Pressable
      onPress={() => onPress(token)}
      className={`
        mr-1.5 mb-2 px-2 py-1 rounded-lg border
        ${isHeavy ? 'bg-white border-gray-300' : 'bg-transparent border-transparent'}
        active:bg-yellow-50
      `}
    >
      <View className="items-center">
        <Text className={`
          text-lg font-medium
          ${isHeavy ? 'text-gray-900' : 'text-gray-500'}
        `}>
          {token.text}
        </Text>
        {token.transliteration && (
          <Text className="text-[10px] italic text-gray-400 -mt-1">
            {token.transliteration}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
