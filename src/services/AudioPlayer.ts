import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

let currentSound: Audio.Sound | null = null;

export const AudioPlayer = {
  async playSentence(text: string) {
    // 1. Unload previous sound if exists
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

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
      const audioData = data.audio;

      if (!audioData) {
        throw new Error("No audio data received");
      }

      // 3. Log payload length
      console.log("Audio Payload Length:", audioData.length);

      // Clean the Base64 string (remove data:audio/mp3;base64, prefix if present)
      const cleanBase64 = audioData.replace(/^data:audio\/.*?;base64,/, '');

      // Define a path
      const uri = FileSystem.cacheDirectory + 'speech.mp3';

      // Write to disk
      await FileSystem.writeAsStringAsync(uri, cleanBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Configure audio mode (important for iOS to play even if switch is silent, etc)
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Play from file
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      currentSound = sound;

      // Unload sound after playback finishes to prevent memory leaks
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
          if (currentSound === sound) {
            currentSound = null;
          }
        }
      });

    } catch (error) {
      console.error("[Audio] Playback failed", error);
    }
  }
};
