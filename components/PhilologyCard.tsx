import { Dimensions, Text, View } from 'react-native';
import WordChip, { Token } from './WordChip'; // <--- This works because they are neighbors

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface PhilologyCardProps {
  modernGreek: string;
  targetTokens?: Token[];
  ancientContext: string;
  englishTranslation: string;
  knot: string;
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
  index,
  total,
  onTokenPress
}: PhilologyCardProps) {

  const handleWordPress = (token: Token) => {
    console.log("Touched Token:", token);
    if (onTokenPress) {
      onTokenPress(token);
    }
  };

  return (
    <View
      className="bg-paper rounded-3xl p-6 mr-4 shadow-sm border border-gray-200 dark:border-gray-700"
      style={{ width: CARD_WIDTH, height: 500 }}
    >
      <View className="flex-row justify-between mb-4">
        <Text className="text-xs font-bold tracking-widest text-gray-400 uppercase">Knot</Text>
        <Text className="text-xs text-gray-400">{index + 1} / {total}</Text>
      </View>

      <View className="mb-6">
        <Text className="text-base text-ink leading-6">
          {knot}
        </Text>
      </View>

      <View className="mb-8 border-l-2 border-gold pl-4">
        <Text className="text-lg font-serif italic text-ancient opacity-80 leading-7">
          {ancientContext}
        </Text>
      </View>

      <View className="flex-1 justify-center">
        <View className="flex-row flex-wrap items-end">
          {targetTokens && targetTokens.length > 0 ? (
            targetTokens.map((token, idx) => (
              <WordChip key={`${token.text}-${idx}`} token={token} onPress={handleWordPress} />
            ))
          ) : (
            <Text className="text-2xl font-bold text-ink leading-9">{modernGreek}</Text>
          )}
        </View>
      </View>

      <View className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Text className="text-base text-ink">{englishTranslation}</Text>
      </View>
    </View>
  );
}