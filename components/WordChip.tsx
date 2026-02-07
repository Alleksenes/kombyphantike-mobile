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
  isClozed?: boolean;
  isFocused?: boolean;
}

export default function WordChip({ token, onPress, isClozed = false, isFocused = false }: WordChipProps) {
  const isHeavy = ['NOUN', 'VERB', 'ADJ', 'PROPN'].includes(token.pos);
  const isPunctuation = token.pos === 'PUNCT';

  if (isPunctuation) {
    return (
      <Text className="text-xl text-ink font-serif self-end mb-1">
        {token.text}
      </Text>
    );
  }

  // Clozed State
  if (isClozed) {
    return (
      <Pressable
        onPress={() => onPress(token)}
        className="mr-1.5 mb-2 px-2 py-1 rounded-lg border-b border-gold items-center justify-center min-w-[40px]"
      >
        <Text className="text-lg font-medium text-gold">
          ____
        </Text>
      </Pressable>
    );
  }

  // Focused & Normal State logic
  let containerStyle = "mr-1.5 mb-2 px-2 py-1 rounded-lg border ";
  let textStyle = "text-lg font-medium ";
  let subTextStyle = "text-[10px] italic -mt-1 ";

  if (isFocused) {
    containerStyle += "bg-gold border-gold";
    textStyle += "text-black"; // Black text on Gold
    subTextStyle += "text-black/60";
  } else {
    // Normal
    containerStyle += "bg-transparent border-transparent";
    // For heavy words, we might want a subtle indicator, but for now we follow the "text in #e3dccb" instruction.
    // If needed, we can add a subtle border for heavy words to distinguish them as interactive.
    if (isHeavy) {
       containerStyle += "border-white/10"; // Very subtle border
    }

    textStyle += "text-ink"; // Warm Parchment
    subTextStyle += "text-gray-500";
  }

  return (
    <Pressable
      onPress={() => onPress(token)}
      className={containerStyle}
    >
      <View className="items-center">
        <Text className={textStyle}>
          {token.text}
        </Text>
        {token.transliteration && (
          <Text className={subTextStyle}>
            {token.transliteration}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
