import { Dimensions, Text, View } from 'react-native';
import WordChip, { Token } from './WordChip'; // <--- This works because they are neighbors

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface PhilologyCardProps {
  modernGreek: string;
  targetTokens?: Token[];
  ancientContext: string;
  englishTranslation: string;
  index: number;
  total: number;
}

export default function PhilologyCard({
  modernGreek,
  targetTokens,
  ancientContext,
  englishTranslation,
  index,
  total
}: PhilologyCardProps) {

  const handleWordPress = (token: Token) => {
    console.log("Touched Token:", token);
  };

  return (
    <View
      className="bg-[#F8F5F2] rounded-3xl p-6 mr-4 shadow-sm border border-gray-200"
      style={{ width: CARD_WIDTH, height: 500 }}
    >
      <View className="flex-row justify-between mb-4">
        <Text className="text-xs font-bold tracking-widest text-gray-400 uppercase">Knot</Text>
        <Text className="text-xs text-gray-400">{index + 1} / {total}</Text>
      </View>

      <View className="mb-8 border-l-2 border-yellow-600 pl-4">
        <Text className="text-lg font-serif italic text-gray-800 opacity-80 leading-7">
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
            <Text className="text-2xl font-bold text-gray-900 leading-9">{modernGreek}</Text>
          )}
        </View>
      </View>

      <View className="mt-8 pt-4 border-t border-gray-100">
        <Text className="text-base text-gray-700">{englishTranslation}</Text>
      </View>
    </View>
  );
}