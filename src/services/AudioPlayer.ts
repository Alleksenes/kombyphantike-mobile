import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export const AudioPlayer = {
  async playSentence(text: string) {
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
      console.log(`[Audio] Requesting speech for: "${text.substring(0, 20)}..."`);

      const response = await fetch(`${baseUrl}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Audio fetch failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.audio) {
        throw new Error("No audio data received");
      }

      // data.audio is a base64 string
      // Assuming the backend returns raw base64 without prefix, or we need to handle it.
      // Usually simple base64 strings need a data URI prefix.
      const audioUri = `data:audio/mp3;base64,${data.audio}`;

      // Configure audio mode (important for iOS to play even if switch is silent, etc)
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      // Unload sound after playback finishes to prevent memory leaks
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });

    } catch (error) {
      console.error("[Audio] Playback failed", error);
    }
  }
};
