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
  knot_definition?: string;
  knot_context?: string;
}

interface WordChipProps {
  token: Token;
  onPress: (token: Token) => void;
  onLongPress: (token: Token) => void;
  isFocused?: boolean;
}

export default function WordChip({ token, onPress, onLongPress, isFocused = false }: WordChipProps) {
  const isHeavy = ['NOUN', 'VERB', 'ADJ', 'PROPN'].includes(token.pos);
  const isPunctuation = token.pos === 'PUNCT';

  if (isPunctuation) {
    return (
      <Text className="text-xl text-text font-serif self-end mb-1">
        {token.text}
      </Text>
    );
  }

  // Interaction State Logic
  let containerStyle = "mr-1.5 mb-2 px-1 py-1 "; // Reduced horizontal padding to look more like text
  let textStyle = "text-lg font-medium ";
  let subTextStyle = "text-[10px] italic -mt-1 ";

  if (isFocused) {
    // Focused: Highlights the word being inspected
    containerStyle += "bg-accent rounded-lg";
    textStyle += "text-background"; // Dark text on Gold
    subTextStyle += "text-background/60";
  } else {
    // Normal: Transparent background with subtle underline for interactivity
    containerStyle += "bg-transparent border-b ";

    if (isHeavy) {
       containerStyle += "border-text/20"; // Subtle visual cue
    } else {
       containerStyle += "border-transparent";
    }

    textStyle += "text-text"; // Warm Parchment
    subTextStyle += "text-gray-500";
  }

  return (
    <Pressable
      onPress={() => onPress(token)}
      onLongPress={() => onLongPress(token)}
      delayLongPress={500}
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
