import { useState } from 'react';
import { View, Text, TextInput, Pressable, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import OmegaLoader from '../../components/OmegaLoader';
import { SessionStore } from '../../services/SessionStore';
import { API_BASE_URL } from '../../src/services/apiConfig';

export default function WeaverScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWeave = async () => {
    if (!theme.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/draft_curriculum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        throw new Error('Failed to create curriculum');
      }

      const data = await response.json();

      // Assuming the response structure based on requirements:
      // { curriculum_id: string, draft_data: any[] }
      if (data && data.draft_data) {
        SessionStore.setDraft(data.draft_data, false);
        SessionStore.setTheme(theme);
        SessionStore.setInstructions(theme); // Use theme as instructions for now
        router.push('/results');
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err) {
      console.error(err);
      setError('Failed to weave curriculum. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center px-6">

          <Text className="text-3xl font-greek text-text mb-8 text-center">
            Create a Curriculum
          </Text>

          <View className="w-full max-w-md">
            <TextInput
              placeholder="Enter a Theme (e.g., 'Justice', 'The Sea')..."
              placeholderTextColor="#7d7d7d"
              value={theme}
              onChangeText={setTheme}
              className="w-full p-4 rounded-lg bg-card text-text border-2 border-transparent focus:border-accent text-lg font-ui mb-6"
              autoCapitalize="sentences"
              returnKeyType="done"
              onSubmitEditing={handleWeave}
            />

            <Pressable
              onPress={handleWeave}
              disabled={isLoading || !theme.trim()}
              className={`w-full bg-accent py-4 rounded-full items-center active:opacity-80 ${
                isLoading || !theme.trim() ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-background font-bold text-lg font-ui">
                Weave Curriculum
              </Text>
            </Pressable>

            {isLoading && (
              <View className="mt-8 items-center">
                <OmegaLoader size={48} color="#C0A062" />
                <Text className="text-accent mt-4 font-ui italic">
                  Weaving the threads of knowledge...
                </Text>
              </View>
            )}

            {error && (
              <Text className="text-red-500 mt-4 text-center font-ui">
                {error}
              </Text>
            )}
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
