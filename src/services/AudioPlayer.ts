import { createVideoPlayer, VideoPlayer } from 'expo-video';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

let player: VideoPlayer | null = null;

export const AudioPlayer = {
  async playSentence(text: string) {
    try {
      // 1. Fetch Audio
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

      console.log("Audio Payload Length:", audioData.length);

      // 2. Write to file
      const cleanBase64 = audioData.replace(/^data:audio\/.*?;base64,/, '');
      const uri = FileSystem.cacheDirectory + 'speech.mp3';

      // If player exists, pause it before writing to file to avoid locks
      if (player) {
          player.pause();
          // Release the file handle by setting source to null
          player.replace(null);
      }

      await FileSystem.writeAsStringAsync(uri, cleanBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`[Audio] File written to: ${uri}`);

      // 3. Play
      if (!player) {
        player = createVideoPlayer(uri);

        // Add event listener for logging
        player.addListener('playToEnd', () => {
             console.log('[Audio] Playback finished');
        });

        player.addListener('statusChange', (event) => {
            if (event.status === 'error') {
                console.error('[Audio] Player Error:', event.error?.message);
            }
        });
      } else {
        player.replace(uri);
      }

      // Configure player
      player.loop = false;
      player.play();

    } catch (error) {
      console.error("[Audio] Playback failed", error);
    }
  }
};
