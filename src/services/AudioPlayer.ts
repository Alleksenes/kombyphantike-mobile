import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL } from './apiConfig';

let soundObject: Audio.Sound | null = null;

export const AudioPlayer = {
  async playSentence(text: string) {
    try {
      // 1. Fetch Audio
      console.log(`[Audio] Requesting speech for: "${text.substring(0, 20)}..."`);

      const response = await fetch(`${API_BASE_URL}/speak`, {
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

      console.log("Audio Payload Length:", audioData.length);

      // 2. Write to file
      const cleanBase64 = audioData.replace(/^data:audio\/.*?;base64,/, '');
      const uri = FileSystem.cacheDirectory + 'temp.mp3';

      // Unload previous sound if exists to release resources and file locks
      if (soundObject) {
        try {
            await soundObject.unloadAsync();
        } catch (e) {
            console.warn("Failed to unload previous sound", e);
        }
        soundObject = null;
      }

      await FileSystem.writeAsStringAsync(uri, cleanBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`[Audio] File written to: ${uri}`);

      // 3. Play using expo-av
      // Ensure audio mode is configured for playback
      await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          stayActiveInBackground: false,
          shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
      );

      soundObject = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
              if (status.didJustFinish) {
                  console.log('[Audio] Playback finished');
                  // Optionally unload immediately or wait for next play
                  // sound.unloadAsync();
              }
          } else if (status.error) {
              console.error(`[Audio] Player Error: ${status.error}`);
          }
      });

    } catch (error) {
      console.error("[Audio] Playback failed", error);
    }
  }
};
