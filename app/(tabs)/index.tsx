import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function WeaverScreen() {
  const router = useRouter();

  const handleWeave = () => {
    // This now happens ONLY when the user presses the button
    router.push('/results');
  };

  return (
    <View className="flex-1 items-center justify-center bg-background">
      {/* We can add the Omega Loader here later */}
      <Pressable
        onPress={handleWeave}
        className="bg-accent py-4 px-8 rounded-lg"
      >
        <Text className="text-background text-lg font-bold" style={{ fontFamily: 'NeueHaasGrotesk' }}>
          Weave Curriculum
        </Text>
      </Pressable>
    </View>
  );
}
